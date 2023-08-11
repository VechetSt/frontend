import React, { useEffect, useMemo, useState } from 'react'
import { Box, Grid } from 'theme-ui'

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js'
import { Line } from 'react-chartjs-2'

// Components
import { Flex, Text, CheckBox, Spinner } from 'components/uikit'

// Hooks
import useIsMobile from 'hooks/useIsMobile'
import { useTranslation } from 'contexts/Localization'

// Helpers
import { getChartOptions } from './utils/getChartOptions'
import { getDataSets } from './utils/getDataSets'

// Types
import { SimpleTokenProfile } from 'state/lhd/types'
import { DatasetNames } from './types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

const HistoricalChart = ({
  tokenHistoric,
  isLoading,
  selectedHistorical,
  setSelectedHistorical,
}: {
  tokenHistoric: SimpleTokenProfile[] | never[]
  isLoading: boolean
  selectedHistorical: string[]
  setSelectedHistorical: (newList: (prevList: any) => any[]) => void
}) => {
  const isMobile = useIsMobile()
  const { t } = useTranslation()
  const data = useMemo(() => getDataSets(tokenHistoric), [tokenHistoric])

  const [chartData, setChartData] = useState(data)
  const [toggledData, setToggledData] = useState(() => {
    let initialState: Record<DatasetNames, boolean> = {
      [DatasetNames.LiquidityDebt]: false,
      [DatasetNames.MarketCap]: true,
      [DatasetNames.OwnedLiquidity]: false,
      [DatasetNames.TotalExtractableLiquidity]: false,
      [DatasetNames.ConcentrationScore]: false,
      [DatasetNames.HealthScore]: false,
      [DatasetNames.OwnershipScore]: false,
      [DatasetNames.TotalScore]: false,
    }

    selectedHistorical.forEach((datasetName) => {
      // @ts-ignore
      if (initialState[datasetName] !== undefined) {
        // @ts-ignore
        initialState[datasetName] = true
      }
    })

    return initialState
  })

  useEffect(() => {
    const filteredData = data.datasets.filter((set) => toggledData[set.label as DatasetNames])
    setChartData({ ...data, datasets: filteredData })
  }, [data])

  const options = getChartOptions(toggledData, isMobile)

  const handleDataToggle = ({ datasetName }: { datasetName: DatasetNames }): void => {
    // Step 1: Update state based on the previous state
    setToggledData((prevState) => {
      const updatedToggledData = { ...prevState, [datasetName]: !prevState[datasetName] }

      // Step 2: Filter the datasets based on the updated state
      const newChartData = data.datasets.filter((set) => {
        if (set.label === datasetName) {
          return updatedToggledData[datasetName]
        }
        return updatedToggledData[set.label as DatasetNames]
      })

      setChartData({ ...chartData, datasets: newChartData })

      // Step 3: Inform the parent about the change
      if (updatedToggledData[datasetName]) {
        setSelectedHistorical((prevList) => [...prevList, datasetName])
      } else {
        setSelectedHistorical((prevList) => prevList.filter((item: DatasetNames) => item !== datasetName))
      }

      return updatedToggledData
    })
  }

  if (isLoading && !tokenHistoric.length) {
    return (
      <Flex sx={{ flex: 1, alignItems: 'center' }}>
        <Spinner size={200} />
      </Flex>
    )
  }

  return (
    <Box sx={{ width: '100%', height: '100%', flexDirection: 'column', p: '20px' }}>
      <Line options={options} data={chartData} />
      <Grid
        sx={{
          gridTemplateColumns: ['1fr 1fr', '1fr 1fr', '0.7fr 1fr 1fr 1fr'],
          mt: '10px',
        }}
      >
        {Object.values(DatasetNames).map((datasetName) => (
          <Flex
            key={datasetName}
            sx={{
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => handleDataToggle({ datasetName })}
          >
            <CheckBox checked={toggledData[datasetName]} />
            <Text ml="5px" sx={{ fontSize: ['9px', '9px', '12px'], fontWeight: '500' }}>
              {t(datasetName)}
              <Flex
                sx={{
                  float: 'right',
                  width: '8px',
                  height: '8px',
                  borderRadius: '15px',
                  background: data.datasets.filter((x) => x.label === datasetName)[0].backgroundColor,
                  ml: '4px',
                  mt: '8px',
                }}
              />
            </Text>
          </Flex>
        ))}
      </Grid>
    </Box>
  )
}

export default HistoricalChart