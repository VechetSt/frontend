import { useWeb3React } from '@web3-react/core'
import DexNav from 'components/DexNav'
import { Flex } from 'components/uikit'
import { useV3NFTPositionManagerContract } from 'hooks/useContract'
import {
  useRangeHopCallbacks,
  useV3DerivedMintInfo,
  useV3MintActionHandlers,
  useV3MintState,
} from 'state/mint/v3/hooks'
import { useCurrency } from 'hooks/Tokens'
import { FeeAmount } from '@ape.swap/v3-sdk'
import { useHandleCurrencyASelect, useHandleCurrencyBSelect, useHandleFeeSelect } from './hooks'
import DexPanel from 'components/DexPanel'
import { Bound, Field } from 'state/mint/v3/actions'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Actions from './actions'
import { V3LiquiditySubNav } from 'components/DexNav/LiquiditySubNav'
import DesktopLiquidityParams from './components/DesktopLiquidityParams'
import MobileLiquidityParams from './components/MobileLiquidityParams'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { Currency, CurrencyAmount } from '@ape.swap/sdk-core'
import SwapSwitchButton from 'views/Swap/components/SwapSwitchButton'

const AddLiquidity = ({
  currencyIdA,
  currencyIdB,
  feeAmountFromUrl,
}: {
  currencyIdA: string
  currencyIdB: string
  feeAmountFromUrl?: string
}) => {
  const { account, chainId, provider } = useWeb3React()
  const positionManager = useV3NFTPositionManagerContract()
  const { query } = useRouter()

  const baseCurrency = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  // capital efficiency warning
  const [showCapitalEfficiencyWarning, setShowCapitalEfficiencyWarning] = useState(false)

  // fee selection from url
  const feeAmount: FeeAmount | undefined =
    feeAmountFromUrl && Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrl))
      ? parseFloat(feeAmountFromUrl)
      : undefined

  // prevent an error if they input ETH/WETH
  const quoteCurrency =
    baseCurrency && currencyB && baseCurrency.wrapped.equals(currencyB.wrapped) ? undefined : currencyB

  // mint state
  const { independentField, typedValue, startPriceTypedValue, rightRangeTypedValue, leftRangeTypedValue } =
    useV3MintState()

  const {
    pool,
    ticks,
    dependentField,
    price,
    pricesAtTicks,
    parsedAmounts,
    currencyBalances,
    position,
    noLiquidity,
    currencies,
    errorMessage,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
  } = useV3DerivedMintInfo(baseCurrency ?? undefined, quoteCurrency ?? undefined, feeAmount, baseCurrency ?? undefined)

  console.log(ticks)

  const { onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput, onStartPriceInput } =
    useV3MintActionHandlers(noLiquidity)

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const handleCurrencyASelect = useHandleCurrencyASelect({ currencyIdB, currencyIdA })
  const handleCurrencyBSelect = useHandleCurrencyBSelect({ currencyIdA, currencyIdB })
  const handleFeeSelect = useHandleFeeSelect({ currencyIdA, currencyIdB, onLeftRangeInput, onRightRangeInput })

  // get value and prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {},
  )

  const atMaxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      }
    },
    {},
  )

  console.log(ticks)

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange } =
    useRangeHopCallbacks(baseCurrency ?? undefined, quoteCurrency ?? undefined, feeAmount, tickLower, tickUpper, pool)

  useEffect(() => {
    if (
      query.minPrice &&
      typeof query.minPrice === 'string' &&
      query.minPrice !== leftRangeTypedValue &&
      !isNaN(query.minPrice as any)
    ) {
      onLeftRangeInput(query.minPrice)
    }

    if (
      query.maxPrice &&
      typeof query.maxPrice === 'string' &&
      query.maxPrice !== rightRangeTypedValue &&
      !isNaN(query.maxPrice as any)
    ) {
      onRightRangeInput(query.maxPrice)
    }
  }, [query, rightRangeTypedValue, leftRangeTypedValue, onRightRangeInput, onLeftRangeInput])

  useEffect(() => {
    noLiquidity && (onRightRangeInput(''), onLeftRangeInput(''))
  }, [noLiquidity, onRightRangeInput, onLeftRangeInput])

  return (
    <Flex sx={{ width: '100%', justifyContent: 'center', flexDirection: 'row-reverse' }}>
      <Flex variant="flex.dexContainer">
        <DexNav />
        <V3LiquiditySubNav />
        <MobileLiquidityParams
          feeAmount={feeAmount}
          price={price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined}
          currencyA={currencies[Field.CURRENCY_A] ?? undefined}
          currencyB={currencies[Field.CURRENCY_B] ?? undefined}
          priceLower={priceLower}
          priceUpper={priceUpper}
          ticksAtLimit={ticksAtLimit}
          noLiquidity={noLiquidity}
          startPriceTypedValue={startPriceTypedValue}
          getDecrementLower={getDecrementLower}
          getIncrementLower={getIncrementLower}
          getDecrementUpper={getDecrementUpper}
          getIncrementUpper={getIncrementUpper}
          onHandleFeeSelect={handleFeeSelect}
          onLeftRangeInput={onLeftRangeInput}
          onRightRangeInput={onRightRangeInput}
          handleCurrencyASelect={handleCurrencyASelect}
          handleCurrencyBSelect={handleCurrencyBSelect}
          onStartPriceInput={onStartPriceInput}
        />
        <Flex sx={{ mt: ['10px', '10px', '10px', '10px', '10px', '0px'] }} />
        <DexPanel
          onCurrencySelect={handleCurrencyASelect}
          onUserInput={onFieldAInput}
          value={formattedAmounts[Field.CURRENCY_A]}
          currency={currencies[Field.CURRENCY_A] ?? null}
          otherCurrency={currencies[Field.CURRENCY_B] ?? null}
          handleMaxInput={() => {
            onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
          }}
          locked={depositADisabled}
        />
        {/* <SwapSwitchButton onClick={onSwitchTokens} /> */}
        <Flex sx={{ mt: '48px' }} />
        <DexPanel
          onCurrencySelect={handleCurrencyBSelect}
          onUserInput={onFieldBInput}
          value={formattedAmounts[Field.CURRENCY_B]}
          currency={currencies[Field.CURRENCY_B] ?? null}
          otherCurrency={currencies[Field.CURRENCY_A] ?? null}
          handleMaxInput={() => {
            onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
          }}
          locked={depositBDisabled}
        />
        <Actions
          parsedAmounts={parsedAmounts}
          positionManager={positionManager}
          baseCurrency={currencies[Field.CURRENCY_A]}
          quoteCurrency={currencies[Field.CURRENCY_B]}
          position={position}
          outOfRange={outOfRange}
          noLiquidity={noLiquidity}
          errorMessage={errorMessage}
          invalidRange={invalidRange}
        />
      </Flex>
      <DesktopLiquidityParams
        feeAmount={feeAmount}
        price={price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(6)) : undefined}
        currencyA={currencies[Field.CURRENCY_A] ?? undefined}
        currencyB={currencies[Field.CURRENCY_B] ?? undefined}
        priceLower={priceLower}
        priceUpper={priceUpper}
        ticksAtLimit={ticksAtLimit}
        noLiquidity={noLiquidity}
        startPriceTypedValue={startPriceTypedValue}
        getDecrementLower={getDecrementLower}
        getIncrementLower={getIncrementLower}
        getDecrementUpper={getDecrementUpper}
        getIncrementUpper={getIncrementUpper}
        onHandleFeeSelect={handleFeeSelect}
        onLeftRangeInput={onLeftRangeInput}
        onRightRangeInput={onRightRangeInput}
        onStartPriceInput={onStartPriceInput}
      />
    </Flex>
  )
}

export default AddLiquidity