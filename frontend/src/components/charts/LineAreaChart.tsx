import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltip } from './ChartTooltip'
import { CHART_COLORS, useSvgId, type ValueFormatter } from './chart-utils'

/** Hanya key yang nilainya string/number yang boleh jadi sumbu. */
type KeysOfType<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T] & string

export interface LineAreaChartProps<T extends object> {
  data: T[]
  xKey: KeysOfType<T, string | number>
  yKey: KeysOfType<T, number>
  height?: number
  /** Ruang kosong di atas garis (px) — untuk elemen yang melayang di atas chart. Default 8 */
  insetTop?: number
  /** Format nilai di tooltip */
  formatValue?: ValueFormatter
  /** Format label sumbu Y (mis. formatCompact); tanpa ini sumbu Y disembunyikan */
  formatAxis?: ValueFormatter
  className?: string
}

/** Chart garis smooth + gradient fill, grid tipis horizontal, tooltip kaca (kartu Saldo). */
export function LineAreaChart<T extends object>({
  data,
  xKey,
  yKey,
  height = 220,
  insetTop = 8,
  formatValue,
  formatAxis,
  className,
}: LineAreaChartProps<T>) {
  const gradientId = useSvgId('area')
  const color = CHART_COLORS.primary
  const axisTick = { fill: CHART_COLORS.axisText, fontSize: 11 }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: insetTop, right: 8, bottom: 0, left: formatAxis ? 0 : 8 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} strokeDasharray="4 6" />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={axisTick} dy={8} />
          <YAxis
            hide={!formatAxis}
            width={56}
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            tickFormatter={(v: number) => (formatAxis ? formatAxis(v) : String(v))}
            domain={['auto', 'auto']}
          />
          <Tooltip
            cursor={{ stroke: CHART_COLORS.cursor, strokeWidth: 1, strokeDasharray: '4 4' }}
            content={(props) => <ChartTooltip {...props} formatValue={formatValue} />}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff', fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
