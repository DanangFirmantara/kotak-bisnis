import { useId, useState, type DragEvent } from 'react'
import { ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconCircle } from '@/components/common/IconCircle'

export interface FileDropzoneProps {
  /** Seperti atribut `accept` input: "image/*", ".pdf,image/png" */
  accept?: string
  multiple?: boolean
  disabled?: boolean
  title: string
  description?: string
  /** Dipanggil dengan file yang lolos filter `accept` (urut sesuai pilihan/drop) */
  onFiles: (files: File[]) => void
  className?: string
}

function matchesAccept(file: File, accept: string | undefined): boolean {
  if (!accept) return true
  return accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule)
      if (rule.endsWith('/*')) return file.type.toLowerCase().startsWith(rule.slice(0, -1))
      return file.type.toLowerCase() === rule
    })
}

/**
 * Area pilih / seret file. Satu `<label>` membungkus input file (sr-only) → bisa diklik, Enter/Space lewat
 * input yang fokus, dan tampil focus ring via `focus-within`. Tidak mengunggah apa pun — hanya memberi `File[]`.
 */
export function FileDropzone({
  accept,
  multiple = false,
  disabled = false,
  title,
  description,
  onFiles,
  className,
}: FileDropzoneProps) {
  const inputId = useId()
  const [dragging, setDragging] = useState(false)

  const emit = (list: FileList | null) => {
    const files = Array.from(list ?? []).filter((file) => matchesAccept(file, accept))
    if (files.length > 0) onFiles(multiple ? files : files.slice(0, 1))
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setDragging(false)
    if (!disabled) emit(event.dataTransfer.files)
  }

  return (
    <label
      htmlFor={inputId}
      onDragOver={(event) => {
        event.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex cursor-pointer flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-sage-300/70 bg-glass px-4 py-8 text-center backdrop-blur-xl transition-colors',
        'focus-within:border-sage focus-within:ring-3 focus-within:ring-sage/30 hover:bg-glass-strong',
        dragging && 'border-sage bg-glass-strong',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <input
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          emit(event.target.files)
          event.target.value = '' // pilih file yang sama lagi tetap memicu onChange
        }}
      />
      <IconCircle icon={ImagePlus} size="lg" />
      <span className="text-sm font-semibold text-ink">{title}</span>
      {description && <span className="max-w-sm text-xs text-ink-muted">{description}</span>}
    </label>
  )
}
