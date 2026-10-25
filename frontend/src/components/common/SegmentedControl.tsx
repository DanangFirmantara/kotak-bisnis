import { cn } from '@/lib/utils'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
}

export interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: readonly SegmentedOption<T>[]
  /** Nama grup untuk screen reader, mis. "Mode baca struk" */
  label: string
  disabled?: boolean
  className?: string
}

/** Pilihan tunggal 2–3 opsi berbentuk pill (radiogroup). Tinggi 40px = target sentuh HP. */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  disabled = false,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'inline-flex max-w-full rounded-full border border-glass-border bg-glass-strong p-1 shadow-glass backdrop-blur-xl',
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-10 min-w-0 flex-1 rounded-full px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60',
              selected ? 'bg-sage text-white shadow-glass' : 'text-ink-muted hover:text-ink',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
