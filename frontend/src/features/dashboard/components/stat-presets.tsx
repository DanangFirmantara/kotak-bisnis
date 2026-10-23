import { HandCoins, UserPlus, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import type { StatId, StatSummary } from '@/types/dashboard'
import type { StatCardProps } from '@/components/dashboard/StatCard'
import { MiniBarChart } from '@/components/charts/MiniBarChart'
import { Sparkline } from '@/components/charts/Sparkline'
import { formatByKind, formatCompact, formatCurrency, formatNumber } from '@/lib/format'

interface StatPreset {
  icon?: LucideIcon
  chart: 'bar' | 'spark' | 'none'
  variant: StatCardProps['variant']
}

/** Tampilan per jenis statistik (UI concern — data tetap dari service). */
const STAT_PRESETS: Record<StatId, StatPreset> = {
  spending: { chart: 'bar', variant: 'default' },
  newCustomers: { icon: UserPlus, chart: 'spark', variant: 'default' },
  earningsToday: { icon: HandCoins, chart: 'none', variant: 'default' },
  activity: { chart: 'spark', variant: 'highlight' },
}

function renderVisual(stat: StatSummary, preset: StatPreset): ReactNode {
  if (!stat.trend || stat.trend.length === 0 || preset.chart === 'none') return null
  const formatValue = stat.valueKind === 'currency' ? formatCurrency : formatNumber
  if (preset.chart === 'bar') return <MiniBarChart data={stat.trend} height={48} formatValue={formatValue} />
  return <Sparkline data={stat.trend} height={44} onDark={preset.variant === 'highlight'} formatValue={formatValue} />
}

/** StatSummary (data) → props StatCard (tampilan). */
export function toStatCardProps(stat: StatSummary): StatCardProps {
  const preset = STAT_PRESETS[stat.id]
  return {
    label: stat.label,
    value: formatByKind(stat.value, stat.valueKind),
    compactValue: stat.valueKind === 'currency' ? formatCompact(stat.value, { withCurrency: true }) : undefined,
    icon: preset.icon,
    visual: renderVisual(stat, preset),
    caption: stat.caption,
    live: stat.isLive,
    variant: preset.variant,
  }
}
