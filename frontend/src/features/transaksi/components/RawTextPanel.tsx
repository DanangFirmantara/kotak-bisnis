import { RefreshCw } from 'lucide-react'
import { ActionButton } from '@/components/common/ActionButton'
import { CheckboxField } from '@/components/form/CheckboxField'
import { formatNumber } from '@/lib/format'
import type { ReceiptFlow } from '../useReceiptFlow'
import { PageEditor } from './PageEditor'

export type RawTextPanelProps = Pick<
  ReceiptFlow,
  'pages' | 'setPageText' | 'removeOverlap' | 'setRemoveOverlap' | 'merge' | 'reextractSimple'
>

/** Teks hasil baca (collapsible) di langkah Hasil mode ringkas: koreksi teks → "Ekstrak ulang" mengganti daftar item. */
export function RawTextPanel({ pages, setPageText, removeOverlap, setRemoveOverlap, merge, reextractSimple }: RawTextPanelProps) {
  return (
    <details className="group rounded-3xl border border-glass-border bg-glass p-5 shadow-glass backdrop-blur-xl sm:p-6">
      <summary className="cursor-pointer text-sm font-semibold text-ink outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        Lihat / koreksi teks hasil baca
        <span className="ml-2 text-xs font-normal text-ink-muted">({formatNumber(merge.lines.length)} baris)</span>
      </summary>
      <div className="mt-4 flex flex-col gap-4">
        <p className="text-xs text-ink-muted">
          Perbaiki baris yang salah baca, lalu tekan &ldquo;Ekstrak ulang&rdquo;. Daftar item di atas akan diganti.
        </p>
        {pages.length > 1 && (
          <CheckboxField
            label={`Buang baris tumpang tindih antar foto (${formatNumber(merge.removedCount)} dibuang)`}
            checked={removeOverlap}
            onCheckedChange={(value) => setRemoveOverlap(value === true)}
          />
        )}
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
        <div>
          <ActionButton type="button" tone="glass" onClick={reextractSimple}>
            <RefreshCw aria-hidden />
            Ekstrak ulang dari teks
          </ActionButton>
        </div>
      </div>
    </details>
  )
}
