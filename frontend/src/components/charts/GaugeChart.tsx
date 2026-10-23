import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts'
import { formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import { CHART_COLORS } from './chart-utils'

export interface GaugeChartProps {
  /** 0–100 */
  value: number
  /** Teks kecil di bawah angka, mis. "dari target" */
  caption?: string
  className?: string
}

/**
 * Gauge setengah lingkaran. Chart dirender persegi lalu dipotong separuh atas
 * (Recharts menghitung radius dari sisi terpendek, jadi persegi = radius penuh).
 */
export function GaugeChart({ value, caption, className }: GaugeChartProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const data = [{ name: 'capaian', value: clamped }]

  return (
    <div
      className={cn('relative aspect-[2/1] w-full overflow-hidden', className)}
      role="img"
      aria-label={`Capaian ${formatPercent(clamped, { fractionDigits: 0 })}${caption ? ` ${caption}` : ''}`}
    >
      <div className="absolute inset-x-0 top-0 aspect-square">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={data}
            startAngle={180}
            endAngle={0}
            innerRadius="74%"
            outerRadius="100%"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
            <RadialBar
              dataKey="value"
              cornerRadius={999}
              fill={CHART_COLORS.primary}
              background={{ fill: CHART_COLORS.track }}
              isAnimationActive={false}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="text-2xl font-bold text-ink tabular-nums">
          {formatPercent(clamped, { fractionDigits: 0 })}
        </span>
        {caption && <span className="text-xs text-ink-muted">{caption}</span>}
      </div>
    </div>
  )
}
