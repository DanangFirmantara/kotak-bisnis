import { useId, type ComponentProps, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FIELD_INPUT_CLASS, fieldErrorId } from './field-styles'
import { FormField } from './FormField'

export interface TextFieldProps extends Omit<ComponentProps<'input'>, 'children'> {
  label: string
  /** Ikon dekoratif di kiri input */
  icon?: LucideIcon
  /** Pesan error validasi — mengaktifkan `aria-invalid` + `aria-describedby` */
  error?: string
  /** Elemen di ujung kanan input (mis. tombol tampilkan kata sandi) */
  trailing?: ReactNode
  /** Class untuk pembungkus field (label + input + error); `className` untuk input */
  containerClassName?: string
}

/**
 * Input teks kaca berlabel. Kompatibel `register()` react-hook-form: `{...register('email')}`
 * (React 19 — `ref` adalah prop biasa, tidak perlu forwardRef).
 */
export function TextField({
  label,
  icon: Icon,
  error,
  trailing,
  id,
  className,
  containerClassName,
  ...rest
}: TextFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <FormField id={inputId} label={label} error={error} className={containerClassName}>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden
            strokeWidth={1.8}
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-subtle"
          />
        )}
        <input
          {...rest}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? fieldErrorId(inputId) : undefined}
          className={cn(FIELD_INPUT_CLASS, Icon && 'pl-11', trailing && 'pr-12', className)}
        />
        {trailing && <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>}
      </div>
    </FormField>
  )
}
