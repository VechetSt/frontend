import { Currency, CurrencyAmount, Percent, SupportedChainId, Token } from '@ape.swap/sdk-core'
import { ZapInput, Zap, ZAP_ADDRESS } from '@ape.swap/v2-zap-sdk'
import { useWeb3React } from '@web3-react/core'
import { useApproval } from 'lib/hooks/useApproval'

// wraps useApproveCallback in the context of a swap
export default function useSwapApproval(
  zap: ZapInput,
  allowedSlippage: Percent,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
) {
  const { chainId } = useWeb3React()

  const inAmount = zap.currencyIn.currency
    ? CurrencyAmount.fromRawAmount(zap.currencyIn?.currency, zap.currencyIn?.inputAmount)
    : undefined

  // TODO: Fix supported chain id
  const spender = chainId ? ZAP_ADDRESS[chainId as SupportedChainId] : undefined

  return useApproval(inAmount, spender, useIsPendingApproval)
}
