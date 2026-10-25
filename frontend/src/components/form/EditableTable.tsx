import type { CSSProperties, ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { ActionButton } from '@/components/common/ActionButton'
import { IconButton } from '@/components/common/IconButton'
import { cn } from '@/lib/utils'

export interface EditableTableColumn {
  id: string
  header: string
  /** Lebar kolom di ≥ lg (nilai track grid CSS), mis. "minmax(0,2fr)" atau "7rem" */
  width: string
  /** Di HP kolom ini memakai lebar penuh (default: setengah baris) */
  fullWidthOnMobile?: boolean
  className?: string
}

export interface EditableTableProps<Row extends { id: string }> {
  columns: readonly EditableTableColumn[]
  rows: readonly Row[]
  /** Isi sel untuk (kolom, baris, index). Kontrol (input) milik pemanggil — tabel hanya tata letak. */
  renderCell: (columnId: string, row: Row, index: number) => ReactNode
  onAdd: () => void
  onRemove: (index: number) => void
  addLabel?: string
  /** Nama baris untuk aria-label tombol hapus, mis. (row) => row.name */
  rowLabel: (row: Row, index: number) => string
  /** Baris bermasalah diberi ring peringatan */
  isRowFlagged?: (row: Row) => boolean
  emptyMessage?: string
  disabled?: boolean
}

/**
 * Tabel editable: ≥ lg grid kolom berjudul; di HP tiap baris jadi kartu kecil (2 kolom, judul kolom tampil di atas
 * tiap kontrol) — tanpa horizontal scroll di 360px. Generik: tidak tahu soal react-hook-form / jenis data.
 */
export function EditableTable<Row extends { id: string }>({
  columns,
  rows,
  renderCell,
  onAdd,
  onRemove,
  addLabel = 'Tambah baris',
  rowLabel,
  isRowFlagged,
  emptyMessage = 'Belum ada baris.',
  disabled = false,
}: EditableTableProps<Row>) {
  const gridStyle = { '--cols': `${columns.map((c) => c.width).join(' ')} 2.5rem` } as CSSProperties

  return (
    <div className="flex flex-col gap-3" style={gridStyle}>
      <div
        aria-hidden
        className="hidden gap-2 px-3 text-xs font-semibold tracking-wide text-ink-muted uppercase lg:grid lg:grid-cols-(--cols)"
      >
        {columns.map((column) => (
          <span key={column.id} className={column.className}>
            {column.header}
          </span>
        ))}
        <span />
      </div>

      {rows.length === 0 && <p className="px-1 py-3 text-sm text-ink-muted">{emptyMessage}</p>}

      <ul className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <li
            key={row.id}
            className={cn(
              'grid grid-cols-2 items-start gap-x-2 gap-y-2 rounded-2xl border border-glass-border bg-glass-strong p-3 lg:grid-cols-(--cols) lg:items-center lg:rounded-xl lg:p-2',
              isRowFlagged?.(row) && 'border-warning/60 ring-2 ring-warning/30',
            )}
          >
            {columns.map((column) => (
              <div
                key={column.id}
                className={cn('flex min-w-0 flex-col gap-1', column.fullWidthOnMobile && 'col-span-2 lg:col-span-1', column.className)}
              >
                <span className="text-xs font-semibold text-ink-muted lg:sr-only">{column.header}</span>
                {renderCell(column.id, row, index)}
              </div>
            ))}
            <div className="col-span-2 flex justify-end lg:col-span-1">
              <IconButton
                icon={Trash2}
                label={`Hapus baris ${rowLabel(row, index) || index + 1}`}
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => onRemove(index)}
              />
            </div>
          </li>
        ))}
      </ul>

      <div>
        <ActionButton type="button" tone="glass" disabled={disabled} onClick={onAdd}>
          <Plus aria-hidden />
          {addLabel}
        </ActionButton>
      </div>
    </div>
  )
}
