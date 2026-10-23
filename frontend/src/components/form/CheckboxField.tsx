import { useId, type ComponentProps } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { HIT_AREA } from '@/lib/responsive'
import { cn } from '@/lib/utils'

export interface CheckboxFieldProps extends Omit<ComponentProps<typeof Checkbox>, 'children'> {
  label: string
}

/**
 * Checkbox berlabel (shadcn Checkbox, warna sage). Dengan react-hook-form pakai `Controller`:
 * `checked={field.value} onCheckedChange={(v) => field.onChange(v === true)}`.
 */
export function CheckboxField({ label, id, className, ...rest }: CheckboxFieldProps) {
  const autoId = useId()
  const checkboxId = id ?? autoId

  return (
    <div className="flex items-center gap-2.5">
      <Checkbox
        id={checkboxId}
        className={cn(HIT_AREA, 'size-[18px] rounded-md border-sage-300 bg-glass-strong', className)}
        {...rest}
      />
      <label htmlFor={checkboxId} className={cn(HIT_AREA, 'cursor-pointer text-sm text-ink-muted select-none')}>
        {label}
      </label>
    </div>
  )
}
