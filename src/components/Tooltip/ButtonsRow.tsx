import React from 'react'
import { styles } from './styles'
import { useTranslation } from 'contexts/Localization'
import { ChainId } from '@ape.swap/sdk'
import { useWeb3React } from '@web3-react/core'
import { Flex, Link, Svg, Text } from 'components/uikit'

const ButtonsRow: React.FC<{ projectLink: string; twitter: string; bubble?: string; audit?: string }> = ({
  projectLink,
  twitter,
  bubble,
  audit,
}) => {
  const { t } = useTranslation()
  const { chainId } = useWeb3React()
  const bubbleURL = `https://app.bubblemaps.io/bsc/token/${bubble}`

  return (
    <Flex sx={{ justifyContent: 'center' }}>
      <Flex sx={styles.iconButton}>
        <Link href={projectLink} target="_blank">
          <Svg icon="URL" width={18} />
        </Link>
      </Flex>
      <Flex sx={styles.iconButton}>
        <Link href={twitter} target="_blank">
          <Svg icon="twitter" width={18} color="text" />
        </Link>
      </Flex>
      {chainId === ChainId.BSC && bubble && (
        <Flex sx={styles.iconButton}>
          <Link href={bubbleURL} target="_blank">
            <Svg icon="bubble" width={18} color="text" />
          </Link>
        </Flex>
      )}
      {audit && (
        <Flex sx={{ ...styles.iconButton, margin: '0 0 5px 0', '& svg': { marginRight: '5px' } }}>
          <Link href={audit} target="_blank">
            <Svg icon="audit" width={18} color="text" />
            <Text sx={{ paddingRight: '5px' }}>{t('Audit')}</Text>
          </Link>
        </Flex>
      )}
    </Flex>
  )
}

export default ButtonsRow
