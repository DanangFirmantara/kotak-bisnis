import { CircleAlert, Inbox } from 'lucide-react'
import { HIT_AREA } from '@/lib/responsive'
import { cn } from '@/lib/utils'
import { IconCircle } from './IconCircle'

export interface StateMessageProps {
  tone: 'error' | 'empty'
  title: string
  description?: string
  /** Tampilkan tombol "Coba lagi" (biasanya `() => void refetch()`) */
  onRetry?: () => void
  onDark?: boolean
  className?: string
}

/** Pesan error / kosong di dalam kartu (dipakai semua kartu yang fetch data). */
export function StateMessage({ tone, title, description, onRetry, onDark = false, className }: StateMessageProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex h-full items-center gap-3', className)}
    >
      <IconCircle icon={tone === 'error' ? CircleAlert : Inbox} variant={onDark ? 'onDark' : 'soft'} size="sm" />
      <div className="min-w-0">
        <p className={cn('text-sm font-semibold', onDark ? 'text-white' : 'text-ink')}>{title}</p>
        {description && (
          <p className={cn('mt-0.5 text-xs', onDark ? 'text-white/75' : 'text-ink-muted')}>{description}</p>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              HIT_AREA,
              'mt-1.5 rounded-sm text-xs font-semibold outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50',
              onDark ? 'text-white' : 'text-sage-dark',
            )}
          >
            Coba lagi
          </button>
        )}
      </div>
    </div>
  )
}
