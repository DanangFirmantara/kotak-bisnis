import { FileText, ScanText } from 'lucide-react'
import { ActionButton } from '@/components/common/ActionButton'
import { ProgressBar } from '@/components/common/ProgressBar'
import { SegmentedControl, type SegmentedOption } from '@/components/common/SegmentedControl'
import { StateMessage } from '@/components/common/StateMessage'
import { FileDropzone } from '@/components/form/FileDropzone'
import { GlassCard } from '@/components/ui/GlassCard'
import { getErrorMessage } from '@/lib/api'
import type { ReadProgress } from '@/types/receipt'
import type { ReceiptFlow, ReceiptMode } from '../useReceiptFlow'
import { PhotoList } from './PhotoList'
import { ReceiptTips } from './ReceiptTips'

const MODE_OPTIONS: SegmentedOption<ReceiptMode>[] = [
  { value: 'simple', label: 'Ringkas' },
  { value: 'full', label: 'Lengkap' },
]

const MODE_HINT: Record<ReceiptMode, string> = {
  simple: 'Nama produk + harga net + total saja. Rincian qty, diskon, dan header toko diabaikan. Paling cepat.',
  full: 'Atur sendiri pola struk toko (qty, harga satuan, diskon) dan simpan sebagai template.',
}

export type UploadStepProps = Pick<
  ReceiptFlow,
  | 'mode'
  | 'setMode'
  | 'photos'
  | 'addPhotos'
  | 'removePhoto'
  | 'movePhoto'
  | 'readReceipt'
  | 'readSample'
  | 'reading'
  | 'readError'
  | 'progress'
  | 'progressTotal'
>

function progressView(progress: ReadProgress, total: number) {
  if (progress.phase === 'init') {
    return { value: progress.ratio, label: 'Menyiapkan mesin baca (pertama kali agak lama)…' }
  }
  const safeTotal = Math.max(total, 1)
  return {
    value: (progress.page + progress.ratio) / safeTotal,
    label: `Membaca foto ${Math.min(progress.page + 1, safeTotal)} dari ${safeTotal}`,
  }
}

/** Langkah 1: pilih / seret foto struk, urutkan, lalu "Baca struk" (OCR di browser). Atau coba dengan contoh struk. */
export function UploadStep({
  mode,
  setMode,
  photos,
  addPhotos,
  removePhoto,
  movePhoto,
  readReceipt,
  readSample,
  reading,
  readError,
  progress,
  progressTotal,
}: UploadStepProps) {
  const total = photos.length
  const view = reading && progress ? progressView(progress, progressTotal) : null

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <SegmentedControl label="Mode baca struk" value={mode} onChange={setMode} options={MODE_OPTIONS} disabled={reading} className="w-full sm:w-72" />
          <p className="px-1 text-xs text-ink-muted">{MODE_HINT[mode]}</p>
        </div>

        <FileDropzone
          accept="image/*"
          multiple
          disabled={reading}
          onFiles={addPhotos}
          title={total > 0 ? 'Tambah foto lagi' : 'Pilih atau seret foto struk'}
          description="Bisa lebih dari satu foto untuk struk yang panjang. Dibaca di perangkat Anda — foto tidak diunggah ke mana pun."
        />

        {total > 0 && <PhotoList photos={photos} disabled={reading} onMove={movePhoto} onRemove={removePhoto} />}

        {readError && !reading && (
          <GlassCard className="p-4 sm:p-5">
            <StateMessage
              tone="error"
              title="Struk gagal dibaca"
              description={getErrorMessage(readError, 'Terjadi kesalahan saat membaca struk.')}
              onRetry={total > 0 ? readReceipt : undefined}
            />
          </GlassCard>
        )}

        {view && <ProgressBar value={view.value} label={view.label} />}

        <div className="flex flex-wrap gap-3">
          <ActionButton type="button" disabled={total === 0 || reading} onClick={readReceipt}>
            <ScanText aria-hidden />
            {reading ? 'Membaca…' : 'Baca struk'}
          </ActionButton>
          <ActionButton type="button" tone="glass" disabled={reading} onClick={readSample}>
            <FileText aria-hidden />
            Coba dengan contoh struk
          </ActionButton>
        </div>
      </div>

      <ReceiptTips />
    </div>
  )
}
