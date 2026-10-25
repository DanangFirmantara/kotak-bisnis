import type { ReactNode } from 'react'
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { MEDIA_QUERY } from '@/lib/responsive'
import { ChartTooltip } from './ChartTooltip'
import { CHART_COLORS, defaultValueFormatter, type ValueFormatter } from './chart-utils'

export interface HorizontalBarChartProps<T> {
  data: readonly T[]
  /** Properti string pada `T` untuk label sumbu kiri */
  labelKey: keyof T & string
  /** Properti angka pada `T` untuk panjang bar */
  valueKey: keyof T & string
  /** Label nilai di ujung bar */
  formatValue?: ValueFormatter
  /** Nilai penuh di tooltip (default = `formatValue`) */
  formatTooltipValue?: ValueFormatter
  /** Baris yang digambar redup (mis. agregat "Lainnya") */
  isMuted?: (row: T) => boolean
  /** Teks tambahan di tooltip (mis. "12,3% dari total") */
  getDetail?: (row: T) => string | undefined
  /** Nama untuk screen reader */
  ariaLabel: string
  className?: string
}

const ROW_HEIGHT = 32
const CHART_PADDING = 8
const WIDE_LABEL_CHARS = 24
const NARROW_LABEL_CHARS = 14

const truncate = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text)

/**
 * Bar horizontal peringkat (label panjang di kiri, nilai di ujung bar). Satu warna aksen; baris `isMuted` redup.
 * Tinggi otomatis = jumlah baris. Label dipotong "…" (nama penuh di tooltip). Sumbu X disembunyikan.
 */
export function HorizontalBarChart<T extends object>({
  data,
  labelKey,
  valueKey,
  formatValue = defaultValueFormatter,
  formatTooltipValue,
  isMuted,
  getDetail,
  ariaLabel,
  className,
}: HorizontalBarChartProps<T>) {
  const wide = useMediaQuery(MEDIA_QUERY.sm)
  // Nama yang sama boleh muncul dua kali → sumbu kategori memakai index, bukan teks label
  const rows = data.map((row, index) => ({ index, label: String(row[labelKey] ?? ''), value: Number(row[valueKey]) || 0 }))
  const labelOf = (index: number) => rows[index]?.label ?? ''

  return (
    <div role="img" aria-label={ariaLabel} className={className} style={{ height: data.length * ROW_HEIGHT + CHART_PADDING }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: wide ? 76 : 64, bottom: 4, left: 0 }}
          barCategoryGap="28%"
        >
          <XAxis type="number" hide domain={[0, 'dataMax']} />
          <YAxis
            type="category"
            dataKey="index"
            width={wide ? 168 : 104}
            tickLine={false}
            axisLine={false}
            interval={0}
            tick={{ fill: CHART_COLORS.axisText, fontSize: 12 }}
            tickFormatter={(index: number) => truncate(labelOf(index), wide ? WIDE_LABEL_CHARS : NARROW_LABEL_CHARS)}
          />
          <Tooltip
            cursor={{ fill: CHART_COLORS.track, opacity: 0.5 }}
            content={(props): ReactNode => {
              const entry: unknown = props.payload[0]?.payload
              const index = typeof entry === 'object' && entry !== null && 'index' in entry ? entry.index : undefined
              const row = typeof index === 'number' ? data[index] : undefined
              if (typeof index !== 'number' || !row) return null
              return (
                <ChartTooltip
                  {...props}
                  label={labelOf(index)}
                  formatValue={formatTooltipValue ?? formatValue}
                  detail={getDetail?.(row)}
                />
              )
            }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive={false} maxBarSize={18}>
            {rows.map((row) => {
              const source = data[row.index]
              return (
                <Cell key={row.index} fill={source && isMuted?.(source) ? CHART_COLORS.cursor : CHART_COLORS.primary} />
              )
            })}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value: unknown) => (typeof value === 'number' ? formatValue(value) : '')}
              style={{ fill: 'var(--color-ink)', fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
