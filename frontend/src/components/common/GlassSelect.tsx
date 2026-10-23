import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HIT_AREA } from '@/lib/responsive'
import { cn } from '@/lib/utils'

export interface SelectOption<T extends string> {
  value: T
  label: string
}

export interface GlassSelectProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: readonly SelectOption<T>[]
  /** Nama untuk screen reader, mis. "Periode saldo" */
  label: string
  className?: string
}

/** Dropdown pill kaca (shadcn Select) dengan value bertipe union string. */
export function GlassSelect<T extends string>({ value, onChange, options, label, className }: GlassSelectProps<T>) {
  const handleChange = (next: string) => {
    const match = options.find((o) => o.value === next)
    if (match) onChange(match.value) // narrowing string → T tanpa cast
  }

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger
        size="sm"
        aria-label={label}
        className={cn(
          HIT_AREA,
          'rounded-full border-glass-border bg-glass-strong px-3 text-xs font-medium text-ink-muted shadow-glass backdrop-blur-xl hover:text-ink',
          className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="end"
        className="rounded-2xl border border-glass-border bg-glass-strong shadow-glass backdrop-blur-xl"
      >
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="rounded-xl text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
