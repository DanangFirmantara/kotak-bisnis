import { useId } from 'react'
import { SectionHeader } from '@/components/common/SectionHeader'
import { FIELD_TEXTAREA_CLASS } from '@/components/form/field-styles'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatNumber } from '@/lib/format'
import { TEXT_MICRO } from '@/lib/responsive'
import { cn } from '@/lib/utils'

/** Editor teks satu foto (satu baris struk per baris) + daftar baris duplikat yang dibuang. */
export function PageEditor({
  index,
  fileName,
  text,
  removed,
  onChange,
}: {
  index: number
  fileName: string
  text: string
  removed: readonly string[]
  onChange: (text: string) => void
}) {
  const id = useId()
  const lineCount = text.split('\n').filter((l) => l.trim()).length

  return (
    <GlassCard className="flex flex-col gap-3 p-5 sm:p-6">
      <SectionHeader
        title={`Bagian ${index + 1}`}
        subtitle={`${fileName} · ${formatNumber(lineCount)} baris`}
        action={
          removed.length > 0 ? (
            <span className={cn(TEXT_MICRO, 'rounded-full bg-warning-soft px-2.5 py-1 font-semibold text-warning-deep')}>
              {formatNumber(removed.length)} duplikat dibuang
            </span>
          ) : undefined
        }
      />
      <label htmlFor={id} className="sr-only">
        Teks mentah bagian {index + 1} (satu baris per baris struk)
      </label>
      <textarea
        id={id}
        value={text}
        onChange={(event) => onChange(event.target.value)}
        rows={12}
        spellCheck={false}
        className={cn(FIELD_TEXTAREA_CLASS, 'text-base sm:text-xs')}
      />
      {removed.length > 0 && (
        <details className="text-xs text-ink-muted">
          <summary className="cursor-pointer font-semibold text-sage-dark">Lihat baris yang dibuang</summary>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-white/60 p-3 font-mono leading-relaxed ring-1 ring-glass-line">
            {removed.join('\n')}
          </pre>
        </details>
      )}
    </GlassCard>
  )
}
