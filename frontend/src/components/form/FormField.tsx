import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { fieldErrorId } from './field-styles'

export interface FormFieldProps {
  /** Id kontrol di dalamnya (label `htmlFor` + id pesan error) */
  id: string
  label: string
  /** Pesan error validasi (react-hook-form `errors.x?.message`) */
  error?: string
  className?: string
  children: ReactNode
}

/**
 * Kerangka satu field: label → kontrol → pesan error. Kontrolnya wajib memakai `id` yang sama dan
 * `aria-describedby={fieldErrorId(id)}` saat error (TextField sudah melakukannya).
 */
export function FormField({ id, label, error, className, children }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={fieldErrorId(id)} className="text-xs font-medium text-danger-deep">
          {error}
        </p>
      )}
    </div>
  )
}
