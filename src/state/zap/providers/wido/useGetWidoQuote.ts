import { useQuery } from '@tanstack/react-query'
import { quote, QuoteResult } from 'wido'
import { useSelector } from 'react-redux'
import { useWeb3React } from '@web3-react/core'
import { SupportedChainId } from '@ape.swap/sdk-core'
import { ZapVersion } from '@ape.swap/apeswap-lists'

// Utils
import convertToTokenValue from 'utils/convertToTokenValue'

// Types
import { AppState } from 'state'

// Constants
import { QUERY_KEYS } from 'config/constants/queryKeys'

export const getWidoQuote = async ({
  inputTokenAddress,
  amount,
  toTokenAddress,
  slippagePercentage,
  account,
  chainId,
}: {
  inputTokenAddress: any
  amount: string
  toTokenAddress: string
  slippagePercentage: number
  account: string
  chainId: SupportedChainId
}): Promise<QuoteResult | null> => {
  try {
    const quoteResult = await quote({
      fromChainId: chainId,
      toChainId: chainId,
      fromToken: inputTokenAddress,
      toToken: toTokenAddress,
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
  inputTokenAddress,
  inputTokenDecimals,
  toTokenAddress,
  zapVersion,
}: {
  inputTokenAddress: string
  inputTokenDecimals: number
  toTokenAddress: string
  zapVersion: ZapVersion
}) {
  const { chainId = 137, account = '0x123' } = useWeb3React()
  const { typedValue: amountInput } = useSelector<AppState, AppState['zap']>((state) => state.zap)
  const { userZapSlippage } = useSelector<AppState, AppState['user']>((state) => state.user)

  const amount = convertToTokenValue(amountInput || '0', inputTokenDecimals).toString()
  const slippagePercentage = userZapSlippage / 100 || 0.05
  const isEnabled = Number(amount) > 0 && !!inputTokenAddress && !!toTokenAddress && zapVersion === ZapVersion.External

  return useQuery({
    queryKey: [
      QUERY_KEYS.WIDO_QUOTE,
      { inputTokenAddress },
      { amount },
      { toTokenAddress },
      { slippagePercentage },
      { account },
      { chainId },
    ],
    queryFn: () => getWidoQuote({ inputTokenAddress, amount, toTokenAddress, slippagePercentage, account, chainId }),
    enabled: isEnabled,
  })
}
