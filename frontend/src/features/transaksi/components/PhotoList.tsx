import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { IconButton } from '@/components/common/IconButton'
import { formatNumber } from '@/lib/format'
import type { PhotoItem } from '../useReceiptFlow'

export interface PhotoListProps {
  photos: readonly PhotoItem[]
  disabled?: boolean
  onMove: (id: string, offset: -1 | 1) => void
  onRemove: (id: string) => void
}

/** Daftar foto terurut (atas → bawah) dengan thumbnail preview, urutkan, dan hapus. */
export function PhotoList({ photos, disabled = false, onMove, onRemove }: PhotoListProps) {
  return (
    <ol aria-label="Foto struk, urut dari atas ke bawah" className="flex flex-col gap-2">
      {photos.map((photo, index) => (
        <li
          key={photo.id}
          className="flex items-center gap-3 rounded-2xl border border-glass-border bg-glass-strong p-2.5 shadow-glass"
        >
          <img
            src={photo.url}
            alt={`Pratinjau bagian ${index + 1}`}
            className="h-16 w-12 shrink-0 rounded-lg object-cover ring-1 ring-glass-line"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">Bagian {index + 1}</p>
            <p className="truncate text-xs text-ink-muted">
              {photo.file.name} · {formatNumber(Math.max(1, Math.round(photo.file.size / 1024)))} KB
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <IconButton
              icon={ArrowUp}
              label="Naikkan"
              variant="ghost"
              size="sm"
              disabled={disabled || index === 0}
              onClick={() => onMove(photo.id, -1)}
            />
            <IconButton
              icon={ArrowDown}
              label="Turunkan"
              variant="ghost"
              size="sm"
              disabled={disabled || index === photos.length - 1}
              onClick={() => onMove(photo.id, 1)}
            />
            <IconButton
              icon={Trash2}
              label={`Hapus bagian ${index + 1}`}
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onRemove(photo.id)}
            />
          </div>
        </li>
      ))}
    </ol>
  )
}
