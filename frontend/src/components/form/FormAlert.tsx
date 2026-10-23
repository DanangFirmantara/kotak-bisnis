import { CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FormAlertProps {
  /** Pesan error submit (mis. dari mutation). Kosong = tidak dirender. */
  message?: string | null
  className?: string
}

/** Pesan error tingkat form (hasil submit), tone danger lembut. `role="alert"` → dibacakan screen reader. */
export function FormAlert({ message, className }: FormAlertProps) {
  if (!message) return null

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-medium text-danger-deep',
        className,
      )}
    >
      <CircleAlert aria-hidden strokeWidth={1.8} className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}
