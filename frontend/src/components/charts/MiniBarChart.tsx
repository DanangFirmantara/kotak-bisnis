import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { TrendPoint } from '@/types/dashboard'
import { ChartTooltip } from './ChartTooltip'
import { CHART_COLORS, type ValueFormatter } from './chart-utils'

export interface MiniBarChartProps {
  data: TrendPoint[]
  height?: number
  /** Index bar yang ditonjolkan (default: terakhir). -1 = tidak ada */
  highlightIndex?: number
  formatValue?: ValueFormatter
  className?: string
}

/** Bar kecil tanpa sumbu (kartu Pengeluaran). Bar aktif sage pekat, lainnya sage muda. */
export function MiniBarChart({ data, height = 56, highlightIndex, formatValue, className }: MiniBarChartProps) {
  const activeIndex = highlightIndex ?? data.length - 1

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barCategoryGap="22%">
          <Tooltip
            cursor={{ fill: CHART_COLORS.track, opacity: 0.5, radius: 6 }}
            content={(props) => <ChartTooltip {...props} formatValue={formatValue} />}
          />
          <Bar dataKey="value" radius={[4, 4, 4, 4]} isAnimationActive={false}>
            {data.map((point, i) => (
              <Cell
                key={point.label}
                fill={i === activeIndex ? CHART_COLORS.primary : CHART_COLORS.track}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
