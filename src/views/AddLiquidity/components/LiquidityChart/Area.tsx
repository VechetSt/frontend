import { area, curveStepAfter, ScaleLinear } from 'd3'
import { useMemo } from 'react'
import { ChartEntry } from './types'

export const Area = ({
  series,
  xScale,
  yScale,
  xValue,
  yValue,
  fill,
}: {
  series: ChartEntry[]
  xScale: ScaleLinear<number, number>
  yScale: ScaleLinear<number, number>
  xValue: (d: ChartEntry) => number
  yValue: (d: ChartEntry) => number
  fill?: string | undefined
}) =>
  useMemo(
    () => (
      <path
        sx={{ opacity: .5, stroke: fill ?? 'yellow', fill: fill ?? 'yellow' }}
        d={
          area()
            .curve(curveStepAfter)
            .x((d: unknown) => xScale(xValue(d as ChartEntry)))
            .y1((d: unknown) => yScale(yValue(d as ChartEntry)))
            .y0(yScale(0))(
            series.filter((d) => {
              const value = xScale(xValue(d))
              return value > 0 && value <= window.innerWidth
            }) as Iterable<[number, number]>,
          ) ?? undefined
        }
      />
    ),
    [fill, series, xScale, xValue, yScale, yValue],
  )
