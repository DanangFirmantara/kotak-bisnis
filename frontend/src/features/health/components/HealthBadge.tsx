import { StatusDot } from '@/components/common/StatusDot'
import { cn } from '@/lib/utils'
import type { HealthStatus } from '@/types/health'
import { HEALTH_STATUS_META } from '../health-status'

const BADGE_CLASS: Record<HealthStatus, string> = {
  UP: 'bg-success-soft text-sage-deep',
  DOWN: 'bg-danger-soft text-danger-deep',
  UNKNOWN: 'bg-glass-strong text-ink-muted',
}

/** Pill status keseluruhan. `status` undefined = masih memeriksa. */
export function HealthBadge({ status }: { status?: HealthStatus }) {
  const meta = status ? HEALTH_STATUS_META[status] : undefined

  return (
    <span
      role="status"
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-full border border-glass-border px-3 py-1 text-xs font-semibold',
        status ? BADGE_CLASS[status] : BADGE_CLASS.UNKNOWN,
      )}
    >
      <StatusDot tone={meta?.tone ?? 'muted'} pulse={status === 'UP'} />
      {status === 'UP' ? `OK · ${meta?.label}` : (meta?.label ?? 'Memeriksa…')}
    </span>
  )
}
