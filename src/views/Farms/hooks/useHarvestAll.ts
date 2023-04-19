import { SupportedChainId } from '@ape.swap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import JUNGLE_CHEF_ABI from 'config/abi/jungleChef.json'
import { RPC_URLS } from 'config/constants/networks'
import { ethers } from 'ethers'
import { useDualFarmContract, useMasterChefContract, useMasterChefV2Contract } from 'hooks/useContract'
import { useCallback } from 'react'
import { FarmTypes } from 'state/farms/types'
import { getContract } from 'utils'

const useHarvestAll = (farmTypes: FarmTypes[], pids: number[], contractAddress: string[]) => {
  const { account, chainId } = useWeb3React()
  const masterChefV1Contract = useMasterChefContract()
  const masterChefV2Contract = useMasterChefV2Contract()
  const miniApeContract = useDualFarmContract()

  const callReturn = useCallback(
    async (farmType: FarmTypes, pid: number, contractAddress: string) => {
      const provider = new ethers.providers.JsonRpcProvider(RPC_URLS[chainId as SupportedChainId][0], chainId)
      const jungleFarmContract =
        farmType === FarmTypes.JUNLGE_FARM
          ? getContract(contractAddress ?? '', JUNGLE_CHEF_ABI, provider, account)
          : null
      if (farmType === FarmTypes.MASTER_CHEF_V1) {
        return masterChefV1Contract?.deposit(pid, '0').then((trx) => {
          return trx.wait()
        })
      }
      if (farmType === FarmTypes.MASTER_CHEF_V2) {
        return masterChefV2Contract?.deposit(pid, '0').then((trx) => {
          return trx.wait()
        })
      }
      if (farmType === FarmTypes.JUNLGE_FARM) {
        return jungleFarmContract?.deposit('0').then((trx: any) => {
          return trx.wait()
        })
      }
      if (farmType === FarmTypes.DUAL_FARM) {
        return miniApeContract?.harvest(pid, account ?? '').then((trx) => {
          return trx.wait()
        })
      }
    },
    [account, chainId, masterChefV1Contract, masterChefV2Contract, miniApeContract],
  )

  const handleHarvestAll = useCallback(async () => {
    const harvestPromises = pids.map((pid, i) => {
      return [callReturn(farmTypes[i], pid, contractAddress[i])]
    }, [])
    return Promise.all(harvestPromises)
  }, [callReturn, farmTypes, contractAddress, pids])

  return handleHarvestAll
}

export default useHarvestAll