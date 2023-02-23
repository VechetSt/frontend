import { useWeb3React } from '@web3-react/core'
import PageContainer from 'components/PageContainer'
import { BANANA_ADDRESSES } from 'config/constants/addresses'
import { useRouter } from 'next/router'
import AddLiquidity from 'views/AddLiquidity'

const AddLiquidityPage = () => {
  const { chainId } = useWeb3React()
  const { query } = useRouter()
  const bananaAddress = BANANA_ADDRESSES[chainId || 56]
  // TODO: Default to whatever pair we want
  const [currencyIdA, currencyIdB, feeAmountFromUrl] = (query.currency as string[]) || [undefined, undefined, '']
  // check for existing position if tokenId in url

  return (
    <PageContainer style={{ justifyContent: 'center', marginTop: '100px' }}>
      <AddLiquidity
        currencyIdA={currencyIdA ?? 'ETH'}
        currencyIdB={currencyIdB ?? bananaAddress}
        feeAmountFromUrl={feeAmountFromUrl}
      />
    </PageContainer>
  )
}

export default AddLiquidityPage