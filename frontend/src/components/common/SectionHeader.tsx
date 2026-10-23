import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SectionHeaderProps {
  title: string
  subtitle?: string
  /** Elemen kecil di samping judul, mis. status "Sesuai target" */
  titleAdornment?: ReactNode
  /** Slot kanan: filter, tombol, badge */
  action?: ReactNode
  /** Di atas kartu highlight → teks putih */
  onDark?: boolean
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  titleAdornment,
  action,
  onDark = false,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className={cn('truncate text-sm font-semibold', onDark ? 'text-white/90' : 'text-ink')}>
            {title}
          </h3>
          {titleAdornment}
        </div>
        {subtitle && (
          <p className={cn('mt-0.5 truncate text-xs', onDark ? 'text-white/70' : 'text-ink-muted')}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}
