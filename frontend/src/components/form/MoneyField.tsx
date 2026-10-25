import { useId } from 'react'
import { cn } from '@/lib/utils'
import { fieldErrorId } from './field-styles'
import { FormField } from './FormField'
import { MoneyInput, type MoneyInputProps } from './MoneyInput'

export interface MoneyFieldProps extends MoneyInputProps {
  label: string
  /** Pesan error validasi — mengaktifkan `aria-invalid` + `aria-describedby` */
  error?: string
  containerClassName?: string
}

/** Input uang berlabel (padanan TextField): label → MoneyInput terformat id-ID → pesan error. Prefix default "Rp". */
export function MoneyField({ label, error, id, containerClassName, className, prefix = 'Rp', ...rest }: MoneyFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <FormField id={inputId} label={label} error={error} className={containerClassName}>
      <MoneyInput
        {...rest}
        id={inputId}
        prefix={prefix}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? fieldErrorId(inputId) : undefined}
        className={cn(className)}
      />
    </FormField>
  )
}
