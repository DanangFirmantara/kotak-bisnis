import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { TrendPoint } from '@/types/dashboard'
import { ChartTooltip } from './ChartTooltip'
import { CHART_COLORS, useSvgId, type ValueFormatter } from './chart-utils'

export interface SparklineProps {
  data: TrendPoint[]
  height?: number
  /** Di atas kartu highlight → garis putih */
  onDark?: boolean
  formatValue?: ValueFormatter
  className?: string
}

/** Garis tren kecil tanpa sumbu (kartu statistik). */
export function Sparkline({ data, height = 48, onDark = false, formatValue, className }: SparklineProps) {
  const gradientId = useSvgId('spark')
  const color = onDark ? CHART_COLORS.onDark : CHART_COLORS.primary

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={onDark ? 0.35 : 0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={false}
            content={(props) => <ChartTooltip {...props} formatValue={formatValue} />}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: onDark ? CHART_COLORS.primaryDeep : '#ffffff', fill: color }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
