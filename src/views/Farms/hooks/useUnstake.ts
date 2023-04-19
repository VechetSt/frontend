import { useWeb3React } from '@web3-react/core'
import {
  useDualFarmContract,
  useJungleFarmContract,
  useMasterChefContract,
  useMasterChefV2Contract,
} from 'hooks/useContract'
import { useCallback } from 'react'
import { FarmTypes } from 'state/farms/types'
import BigNumber from 'bignumber.js'

const useUnstake = (farmType: FarmTypes, pid: number, lpValue: number, contractAddress?: string) => {
  const { account } = useWeb3React()
  const masterChefV1Contract = useMasterChefContract()
  const masterChefV2Contract = useMasterChefV2Contract()
  const jungleFarmContract = useJungleFarmContract(contractAddress ?? '')
  const miniApeContract = useDualFarmContract()

  const callReturn = useCallback(
    async (amount: string) => {
      if (farmType === FarmTypes.MASTER_CHEF_V1) {
        return masterChefV1Contract
          ?.withdraw(pid, new BigNumber(amount).times(new BigNumber(10).pow(18)).toString())
          .then((trx) => {
            return trx.wait()
          })
      }
      if (farmType === FarmTypes.MASTER_CHEF_V2) {
        return masterChefV2Contract
          ?.withdraw(pid, new BigNumber(amount).times(new BigNumber(10).pow(18)).toString())
          .then((trx) => {
            return trx.wait()
          })
      }
      if (farmType === FarmTypes.JUNLGE_FARM) {
        return jungleFarmContract
          ?.withdraw(new BigNumber(amount).times(new BigNumber(10).pow(18)).toString())
          .then((trx) => {
            return trx.wait()
          })
      }
      if (farmType === FarmTypes.DUAL_FARM) {
        return miniApeContract
          ?.withdrawAndHarvest(pid, new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(), account ?? '')
          .then((trx) => {
            return trx.wait()
          })
      }
    },
    [pid, farmType, account, masterChefV1Contract, masterChefV2Contract, jungleFarmContract, miniApeContract],
  )

  const handleUnstake = useCallback(
    async (amount: string) => {
      const txHash = await callReturn(amount)
      return txHash
    },
    [callReturn],
  )

  return handleUnstake
}

export default useUnstake