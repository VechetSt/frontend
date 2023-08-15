import { useQuery } from '@tanstack/react-query'
import { quote, QuoteResult } from 'wido'
import { useSelector } from 'react-redux'
import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from '@ape.swap/sdk-core'

// Hooks
import { useV2Pair } from 'hooks/useV2Pairs'

// Utils
import convertToTokenValue from 'utils/convertToTokenValue'
import getCurrencyInfo from 'utils/getCurrencyInfo'

// Types
import { AppState } from 'state'

// Constants
import { QUERY_KEYS } from 'config/constants/queryKeys'

export const getWidoQuote = async ({
  inputCurrencyId,
  amount,
  toToken,
  slippagePercentage,
  account,
  chainId,
}: {
  inputCurrencyId: any
  amount: any
  toToken: string
  slippagePercentage: number
  account: string
  chainId: SupportedChainId
}): Promise<QuoteResult | null> => {
  try {
    const quoteResult = await quote({
      fromChainId: chainId,
      toChainId: chainId,
      fromToken: inputCurrencyId,
      toToken,
      user: account,
      amount,
      slippagePercentage,
    })
    return quoteResult
  } catch (e) {
    console.error({ e })
    return null
  }
}

export default function useGetWidoQuote({
  currencyA,
  currencyB,
  toToken,
}: {
  currencyA: any
  currencyB?: any
  toToken: string
}) {
  const { chainId = 137, account = '0x123' } = useWeb3React()
  const { typedValue: amountInput } = useSelector<AppState, AppState['zap']>((state) => state.zap)
  const { userZapSlippage } = useSelector<AppState, AppState['user']>((state) => state.user)

  const [, pair] = useV2Pair(currencyA, currencyB)

  const { address: inputCurrencyId, decimals } = getCurrencyInfo({ currencyA, currencyB, pair })

  const amount = convertToTokenValue(amountInput || '0', decimals).toString()
  const slippagePercentage = userZapSlippage / 100 || 0.05
  const isEnabled = !currencyA.isNative && Number(amount) > 0 && !!inputCurrencyId && !!toToken

  return useQuery({
    queryKey: [
      QUERY_KEYS.WIDO_QUOTE,
      { inputCurrencyId },
      { amount },
      { toToken },
      { slippagePercentage },
      { account },
      { chainId },
    ],
    queryFn: () => getWidoQuote({ inputCurrencyId, amount, toToken, slippagePercentage, account, chainId }),
    enabled: isEnabled,
  })
}
