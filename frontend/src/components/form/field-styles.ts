/**
 * Gaya kontrol form kaca — satu sumber untuk TextField/PasswordField (dan input lain nanti: textarea, dsb.).
 * Focus ring sage; `aria-invalid` → border + ring danger.
 */
export const FIELD_INPUT_CLASS =
  'h-12 w-full min-w-0 rounded-2xl border border-glass-border bg-glass-strong px-4 text-base text-ink shadow-glass sm:text-sm ' +
  'backdrop-blur-xl outline-none transition-[border-color,box-shadow] placeholder:text-ink-subtle ' +
  'focus-visible:border-sage focus-visible:ring-3 focus-visible:ring-sage/30 ' +
  'aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20 ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

/** Id elemen pesan error milik sebuah field (untuk `aria-describedby`). */
export const fieldErrorId = (fieldId: string) => `${fieldId}-error`
