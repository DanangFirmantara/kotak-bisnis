import { cn } from '@/lib/utils'

export type StatusDotTone = 'success' | 'danger' | 'muted'

const DOT_CLASS: Record<StatusDotTone, string> = {
  success: 'bg-success',
  danger: 'bg-danger',
  muted: 'bg-ink-subtle/60',
}

export interface StatusDotProps {
  tone: StatusDotTone
  /** Denyut halus (ping) — mati saat reduced motion */
  pulse?: boolean
  className?: string
}

/** Titik status kecil (dekoratif — teks status wajib ada di sebelahnya). */
export function StatusDot({ tone, pulse = false, className }: StatusDotProps) {
  return (
    <span aria-hidden className={cn('relative inline-flex size-2 shrink-0', className)}>
      {pulse && (
        <span
          className={cn('absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping', DOT_CLASS[tone])}
        />
      )}
      <span className={cn('relative inline-flex size-2 rounded-full', DOT_CLASS[tone])} />
    </span>
  )
}
