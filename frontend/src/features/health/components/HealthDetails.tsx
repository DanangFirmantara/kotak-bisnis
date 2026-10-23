import type { ReactNode } from 'react'
import { InfoRow } from '@/components/common/InfoRow'
import { Skeleton } from '@/components/common/Skeleton'
import { StatusDot } from '@/components/common/StatusDot'
import { formatDateTime } from '@/lib/format'
import type { ComponentHealth, HealthInfo } from '@/types/health'
import { HEALTH_STATUS_META } from '../health-status'

const GRID = 'grid grid-cols-1 gap-3 text-sm sm:grid-cols-2'

interface Row {
  label: string
  value: ReactNode
  mono?: boolean
}

/** Daftar info health (dl). Urutan = urutan tampil. */
export function HealthDetails({ info }: { info: HealthInfo }) {
  const rows: Row[] = [
    { label: 'Versi app', value: info.version, mono: true },
    { label: 'Last build', value: formatDateTime(info.buildTime) },
    { label: 'Environment', value: info.environment },
    { label: 'Commit', value: info.commit, mono: true },
    { label: 'Frontend', value: <ComponentStatus health={info.frontend} /> },
    { label: 'Backend API', value: <ComponentStatus health={info.backend} /> },
    { label: 'Waktu cek', value: formatDateTime(info.checkedAt) },
  ]

  return (
    <dl className={GRID}>
      {rows.map(({ label, value, mono }) => (
        <InfoRow key={label} label={label} value={value} valueClassName={mono ? 'font-mono' : undefined} />
      ))}
    </dl>
  )
}

function ComponentStatus({ health }: { health: ComponentHealth }) {
  const meta = HEALTH_STATUS_META[health.status]
  return (
    <span className="inline-flex items-center gap-2">
      <StatusDot tone={meta.tone} />
      <span className={health.status === 'UNKNOWN' ? 'text-ink-muted' : undefined}>{health.detail ?? meta.label}</span>
    </span>
  )
}

/** Skeleton seukuran `HealthDetails` (7 baris). */
export function HealthDetailsSkeleton() {
  return (
    <div className={GRID}>
      {Array.from({ length: 7 }, (_, i) => (
        <Skeleton key={i} className="h-[3.75rem] rounded-2xl" />
      ))}
    </div>
  )
}
