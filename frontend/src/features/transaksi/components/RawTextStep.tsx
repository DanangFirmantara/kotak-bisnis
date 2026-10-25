import { ArrowLeft, ArrowRight, Copy } from 'lucide-react'
import { ActionButton } from '@/components/common/ActionButton'
import { SectionHeader } from '@/components/common/SectionHeader'
import { CheckboxField } from '@/components/form/CheckboxField'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatNumber } from '@/lib/format'
import type { ReceiptFlow } from '../useReceiptFlow'
import { PageEditor } from './PageEditor'

export type RawTextStepProps = Pick<ReceiptFlow, 'pages' | 'setPageText' | 'removeOverlap' | 'setRemoveOverlap' | 'merge'> & {
  onBack: () => void
  onNext: () => void
}

/** Langkah 2: teks mentah per foto (bisa diedit — koreksi paling murah), overlap antar foto dibuang otomatis (bisa dibatalkan). */
export function RawTextStep({ pages, setPageText, removeOverlap, setRemoveOverlap, merge, onBack, onNext }: RawTextStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <GlassCard className="flex flex-col gap-3 p-5 sm:p-6">
        <SectionHeader wrapSubtitle
          title="Periksa teks hasil baca"
          subtitle="Perbaiki baris yang salah baca (angka, huruf) sebelum lanjut — satu baris struk per baris."
        />
        {pages.length > 1 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <CheckboxField
              label="Buang baris tumpang tindih antar foto"
              checked={removeOverlap}
              onCheckedChange={(value) => setRemoveOverlap(value === true)}
            />
            <p role="status" className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
              <Copy aria-hidden strokeWidth={1.8} className="size-3.5" />
              {removeOverlap
                ? `Duplikat dibuang: ${formatNumber(merge.removedCount)} baris`
                : 'Duplikat tidak dibuang'}
            </p>
          </div>
        )}
      </GlassCard>

      {pages.map((page, index) => (
        <PageEditor
          key={`${page.fileName}-${index}`}
          index={index}
          fileName={page.fileName}
          text={page.text}
          removed={merge.pages[index]?.removed ?? []}
          onChange={(text) => setPageText(index, text)}
        />
      ))}

      <p className="px-1 text-xs text-ink-muted">Total {formatNumber(merge.lines.length)} baris setelah digabung.</p>

      <div className="flex flex-wrap gap-3">
        <ActionButton type="button" tone="glass" onClick={onBack}>
          <ArrowLeft aria-hidden />
          Kembali
        </ActionButton>
        <ActionButton type="button" disabled={merge.lines.length === 0} onClick={onNext}>
          Lanjut ke pola struk
          <ArrowRight aria-hidden />
        </ActionButton>
      </div>
    </div>
  )
}
