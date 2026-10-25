import { useImperativeHandle, useLayoutEffect, useRef, useState, type ClipboardEvent, type ComponentProps } from 'react'
import { formatNumberInput, parseNumberInput } from '@/lib/format'
import { cn } from '@/lib/utils'
import { FIELD_INPUT_CLASS } from './field-styles'

export interface MoneyInputProps extends Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'type' | 'defaultValue'> {
  /** null = kosong */
  value: number | null
  onChange: (value: number | null) => void
  /** Boleh negatif (diskon / selisih) */
  allowNegative?: boolean
  /** Teks kecil di dalam field sebelum angka, mis. "Rp" */
  prefix?: string
}

/** Kunci posisi caret = jumlah digit di kirinya (titik pemisah muncul/hilang tanpa menggeser kursor). */
const countDigits = (text: string) => text.replace(/\D/g, '').length

function caretAfterDigits(text: string, digits: number): number {
  if (digits <= 0) return text.startsWith('-') ? 1 : 0
  let seen = 0
  for (let i = 0; i < text.length; i++) {
    if (/\d/.test(text[i] ?? '')) seen++
    if (seen === digits) return i + 1
  }
  return text.length
}

/**
 * Input uang terformat id-ID saat mengetik ("55730" → "55.730"). `type="text"` + `inputMode="numeric"`;
 * nilai ke pemanggil tetap `number | null`. Tempel "Rp 55.730" / "55,730" terbaca benar.
 * Kompatibel `Controller` RHF: `value={field.value} onChange={field.onChange} ref={field.ref}` (React 19: ref = prop biasa).
 */
export function MoneyInput({
  value,
  onChange,
  allowNegative = false,
  prefix,
  className,
  onPaste,
  ref,
  ...rest
}: MoneyInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  // `ref` dari pemanggil (Controller field.ref) tetap menunjuk elemen input yang sama
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, [])
  const pendingCaret = useRef<number | null>(null)
  /** Hanya untuk tanda "-" yang baru diketik (belum ada angka → nilai masih null) */
  const [minusDraft, setMinusDraft] = useState(false)

  const display = minusDraft && value === null ? '-' : formatNumberInput(value)

  useLayoutEffect(() => {
    if (pendingCaret.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(pendingCaret.current, pendingCaret.current)
      pendingCaret.current = null
    }
  })

  const apply = (raw: string, caret: number) => {
    const digits = raw.replace(/\D/g, '')
    const negative = allowNegative && raw.includes('-')
    if (!digits) {
      setMinusDraft(negative)
      pendingCaret.current = negative ? 1 : 0
      onChange(null)
      return
    }
    setMinusDraft(false)
    const next = Number(digits) * (negative ? -1 : 1)
    pendingCaret.current = caretAfterDigits(formatNumberInput(next), countDigits(raw.slice(0, caret)))
    onChange(next)
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(event)
    if (event.defaultPrevented) return
    const pasted = parseNumberInput(event.clipboardData.getData('text'), { allowNegative })
    if (pasted === null) return
    event.preventDefault()
    const { selectionStart, selectionEnd } = event.currentTarget
    const start = selectionStart ?? display.length
    const end = selectionEnd ?? start
    if (pasted < 0) {
      onChange(pasted)
      setMinusDraft(false)
      return
    }
    const inserted = String(pasted)
    apply(display.slice(0, start) + inserted + display.slice(end), start + inserted.length)
  }

  return (
    <div className="relative">
      {prefix && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold text-ink-subtle"
        >
          {prefix}
        </span>
      )}
      <input
        {...rest}
        ref={inputRef}
        type="text"
        inputMode={allowNegative ? 'text' : 'numeric'}
        autoComplete="off"
        value={display}
        onChange={(event) => apply(event.target.value, event.target.selectionStart ?? event.target.value.length)}
        onPaste={handlePaste}
        className={cn(FIELD_INPUT_CLASS, 'text-right tabular-nums', prefix && 'pl-10', className)}
      />
    </div>
  )
}
