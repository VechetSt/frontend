import { parseUnits } from '@ethersproject/units'
import { useCallback, useEffect, useMemo } from 'react'
import { ZapType } from '@ape.swap/v2-zap-sdk'
import { useSelector } from 'react-redux'
import { useAllTokens, useCurrency } from 'hooks/Tokens'
import { isAddress } from 'utils'
import { AppState } from '../index'
import {
  Field
} from './actions'
import {
  replaceZapState,
  setInputCurrency,
  setOutputCurrency,
  setInputList,
  setRecipient,
  setZapNewOutputList,
  setZapType,
  typeInput,
} from './slice'
import { useTrackedTokenPairs, useUserZapSlippageTolerance } from '../user/hooks'
import { useAppDispatch } from 'state/hooks'
import { Currency, SupportedChainId, Token, TradeType } from '@ape.swap/sdk-core'
import { useBestTrade } from 'hooks/useBestTrade'
import { useV2Pair } from 'hooks/useV2Pairs'
import { useCurrencyBalances } from 'lib/hooks/useCurrencyBalance'
import { useWeb3React } from '@web3-react/core'
import { useTotalSupply } from 'hooks/useTotalSupply'
import useENS from 'hooks/useENS'
import JSBI from 'jsbi'
import { BANANA_ADDRESSES } from 'config/constants/addresses'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { Protocol } from '@ape.swap/router-sdk'
import { mergeBestZaps } from './mergeBestZaps'
import BigNumber from 'bignumber.js'
import { zapInputTokens } from '@ape.swap/apeswap-lists'
import { TradeState } from 'state/routing/types'
import { checkZapApproval, executeZapApproval } from './thunks'
import { useToastError } from 'state/application/hooks'

export function useZapState(): AppState['zap'] {
  return useSelector<AppState, AppState['zap']>((state) => state.zap)
}

export function useZapActionHandlers(): {
  onZapCurrencySelection: (field: Field, currency: Currency[]) => void
  onZapUserInput: (field: Field, typedValue: string) => void
  onZapChangeRecipient: (recipient: string | null) => void
  onSetZapType: (zapType: ZapType) => void
  onZapApproval: () => Promise<void>
} {
  const dispatch = useAppDispatch()
  // TODO: Send toast error
  const toastError = useToastError()
  const { provider } = useWeb3React()

  const onZapCurrencySelection = useCallback(
    (field: Field, currencies: Currency[]) => {
      const currency = currencies[0]
      if (field === Field.INPUT) {
        dispatch(
          setInputCurrency({
            currencyId: currency instanceof Token ? currency.address : currency.isNative ? 'ETH' : '',
          }),
        )
      } else {
        const currency2 = currencies[1]
        dispatch(
          setOutputCurrency({
            currency1: currency?.isNative ? 'ETH' : currency?.address,
            currency2: currency2?.isNative ? 'ETH' : currency2?.address,
          }),
        )
      }
    },
    [dispatch],
  )

  const onZapUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
      // CHeck for approval
      // dispatch(checkZapApproval())
    },
    [dispatch],
  )

  const onZapChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch],
  )

  const onSetZapType = useCallback(
    (zapType: ZapType) => {
      dispatch(setZapType({ zapType }))
    },
    [dispatch],
  )

  const onZapApproval = useCallback(
    async () => {
      if(!provider) { return }
      await dispatch(executeZapApproval({ provider }))
    },
    [dispatch, provider],
  )

  return {
    onZapCurrencySelection,
    onZapUserInput,
    onZapChangeRecipient,
    onSetZapType,
    onZapApproval,
  }
}

const BAD_RECIPIENT_ADDRESSES: string[] = [
  '0xBCfCcbde45cE874adCB698cC183deBcF17952812', // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // v2 router 01
  '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F', // v2 router 02
]

// TODO: Should be moved to ZapV2 feature
// from the current swap inputs, compute the best trade and return it.
export function useDerivedZapInfo() {
  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currency1: outputCurrencyId1, currency2: outputCurrencyId2 },
    recipient,
  } = useZapState()

  const { account, chainId } = useWeb3React()

  const inputCurrency = useCurrency(inputCurrencyId)
  const out0 = useCurrency(useMemo(() => outputCurrencyId1, [outputCurrencyId1]))
  const out1 = useCurrency(useMemo(() => outputCurrencyId2, [outputCurrencyId2]))

  const outputPair = useV2Pair(out0 ?? undefined, out1 ?? undefined)
  const totalSupply = useTotalSupply(outputPair?.[1]?.liquidityToken)

  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null
  const [allowedSlippage] = useUserZapSlippageTolerance()

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputPair?.[1]?.liquidityToken ?? undefined,
  ])

  // Change to currency amount. Divide the typed input by 2 to get correct distributions
  // Uneven amounts will be rounded down, which would generate a dust amount in wallet of 0.000000000000000001
  const halfTypedValue = typedValue && new BigNumber(typedValue).div(2).toFixed(18, 5)

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(halfTypedValue, inputCurrency ?? undefined),
    [inputCurrency, halfTypedValue],
  )

  const bestZapOne = useBestTrade(TradeType.EXACT_INPUT, parsedAmount, out0 ?? undefined, [Protocol.V2], false, true)
  const bestZapTwo = useBestTrade(TradeType.EXACT_INPUT, parsedAmount, out1 ?? undefined, [Protocol.V2], false, true)

  const bestMergedZaps = useMemo(
    () =>
      mergeBestZaps(
        bestZapOne?.trade,
        bestZapTwo?.trade,
        out0 ?? undefined,
        out1 ?? undefined,
        outputPair,
        allowedSlippage,
        totalSupply,
        chainId || SupportedChainId.BSC,
      ),
    [bestZapOne, bestZapTwo, out0, out1, outputPair, allowedSlippage, totalSupply, chainId],
  )

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: inputCurrency ?? undefined,
  }

  let inputError: string | undefined
  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount'
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT] || !outputPair[1]) {
    inputError = inputError ?? 'Select a token'
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
  } else if (BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1) {
    inputError = inputError ?? 'Invalid recipient'
  }

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    bestMergedZaps?.currencyIn?.inputAmount ? bestMergedZaps?.currencyIn.inputAmount : null,
  ]

  if (balanceIn && amountIn && JSBI.lessThan(balanceIn.quotient, JSBI.BigInt(amountIn))) {
    inputError = `Insufficient ${bestMergedZaps?.currencyIn.currency?.symbol} balance`
  }

  const zapRouteState =
    bestZapOne?.state === TradeState.LOADING ||
    bestZapTwo?.state === TradeState.LOADING ||
    bestZapOne?.state === TradeState.SYNCING ||
    bestZapTwo?.state === TradeState.SYNCING
      ? TradeState.LOADING
      : bestZapOne?.state === TradeState.VALID && bestZapTwo?.state === TradeState.VALID
      ? TradeState.VALID
      : TradeState.INVALID

  return {
    currencies,
    zapRouteState,
    currencyBalances,
    parsedAmount,
    bestMergedZaps,
    inputError,
  }
}

// Set default currencies for zap state
export function useDefaultCurrencies() {
  const { chainId, account } = useWeb3React()
  const dispatch = useAppDispatch()
  useEffect(() => {
    const outputCurrencies = { currency1: 'ETH', currency2: BANANA_ADDRESSES[chainId || SupportedChainId.BSC] }
    const inputCurrency = 'ETH'
    dispatch(
      replaceZapState({
        typedValue: '',
        field: '',
        inputCurrencyId: inputCurrency,
        outputCurrencyId: outputCurrencies,
        recipient: account || null,
        zapType: ZapType.ZAP,
      }),
    )
  }, [dispatch, chainId, account])
}

// Set zap output list. Keep this pretty simple to allow multiple products to use it
// This will be mostly used by products rather than the dex
export function useSetZapOutputList(currencyIds: { currencyIdA: string; currencyIdB: string }[]) {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(setZapNewOutputList({ zapNewOutputList: currencyIds }))
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [currencyIds.length, dispatch])
}

// Hook to set the dex output list.
// Since we want to use multiple token pairs that exists this hook is a bit more involved than the simple setOutputList
export function useSetZapDexOutputList() {
  // Get default token list and pinned pair tokens and create valid pairs
  const trackedTokenPairs = useTrackedTokenPairs()
  useSetZapOutputList(
    useMemo(() => {
      return trackedTokenPairs?.map(([token1, token2]) => {
        return { currencyIdA: token1.address, currencyIdB: token2.address }
      })
    }, [trackedTokenPairs]),
  )
}

// Hook to return the output token list to be used in the search modal
export const useZapOutputList = () => {
  const { zapNewOutputList: currencyIds } = useZapState()
  const tokens = useAllTokens()
  const filteredTokens = useMemo(
    () =>
      currencyIds.map(({ currencyIdA, currencyIdB }: any) => {
        const checkedCurrencyIdA = isAddress(currencyIdA)
        const checkedCurrencyIdB = isAddress(currencyIdB)
        if (!checkedCurrencyIdA || !checkedCurrencyIdB) return null
        return { currencyA: tokens[checkedCurrencyIdA], currencyB: tokens[checkedCurrencyIdB] }
      }),
    [currencyIds, tokens],
  )
  return filteredTokens
}

// Hook to set the zap input list
// TODO: The zap input type is incorrect. This needs to be changed at the state level and throughout the app
export function useSetZapInputList() {
  const dispatch = useAppDispatch()
  useEffect(() => {
    const getZapInputList = () => {
      dispatch(setInputList({ zapInputList: zapInputTokens as any }))
    }
    getZapInputList()
  }, [dispatch])
}

// Hook to use the input list
export function useZapInputList(): { [address: string]: Token } | undefined {
  const { zapInputList } = useZapState()
  if (!zapInputList) return
  return zapInputList
}
