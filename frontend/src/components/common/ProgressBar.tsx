import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  /** 0..1 */
  value: number
  /** Nama untuk screen reader sekaligus teks di atas bar, mis. "Membaca foto 1 dari 2" */
  label: string
  className?: string
}

/** Bar progres kaca (role="progressbar"). Transisi lebar hanya kalau user tidak memilih reduced motion. */
export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-ink-muted">
        <span className="min-w-0 truncate">{label}</span>
        <span className="shrink-0 tabular-nums">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 overflow-hidden rounded-full bg-white/60 ring-1 ring-glass-line"
      >
        <div
          className="h-full rounded-full bg-sage motion-safe:transition-[width] motion-safe:duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
