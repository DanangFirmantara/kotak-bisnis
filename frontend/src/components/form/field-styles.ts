import { cn } from '@/lib/utils'

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

/** Varian ringkas FIELD_INPUT_CLASS untuk sel tabel editable (tinggi 40px, tanpa bayangan). */
export const FIELD_CELL_CLASS = cn(FIELD_INPUT_CLASS, 'h-10 rounded-xl px-3 shadow-none')

/** Textarea kaca (mis. teks mentah struk): tinggi bebas, monospace agar kolom angka sejajar. */
export const FIELD_TEXTAREA_CLASS = cn(FIELD_INPUT_CLASS, 'h-auto min-h-48 rounded-2xl py-3 font-mono leading-relaxed')
