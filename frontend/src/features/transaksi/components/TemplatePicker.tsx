import { useState } from 'react'
import { LayoutTemplate } from 'lucide-react'
import { ActionButton } from '@/components/common/ActionButton'
import { GlassSelect, type SelectOption } from '@/components/common/GlassSelect'
import { useReceiptTemplates } from '@/hooks/useReceipt'
import type { ReceiptTemplate } from '@/types/receipt'

const NONE = 'none'

export interface TemplatePickerProps {
  /** Pakai template → langsung ke hasil */
  onApply: (template: ReceiptTemplate) => void
}

/** Pilih template toko tersimpan; "Pakai template" melompati langkah pemetaan pola. */
export function TemplatePicker({ onApply }: TemplatePickerProps) {
  const query = useReceiptTemplates()
  const [selected, setSelected] = useState<string>(NONE)
  const templates = query.data ?? []

  if (query.isPending) return <p className="text-xs text-ink-muted">Memuat template toko…</p>
  if (query.isError) return <p className="text-xs text-danger-deep">Template toko gagal dimuat.</p>
  if (templates.length === 0) {
    return <p className="text-xs text-ink-muted">Belum ada template toko — simpan pola di bawah supaya struk berikutnya lebih cepat.</p>
  }

  const options: SelectOption<string>[] = [
    { value: NONE, label: 'Pilih template toko…' },
    ...templates.map((t) => ({ value: t.id, label: t.storeName })),
  ]
  const chosen = templates.find((t) => t.id === selected)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <GlassSelect label="Template toko" value={selected} options={options} onChange={setSelected} className="w-full sm:w-64" />
      <ActionButton type="button" tone="glass" disabled={!chosen} onClick={() => chosen && onApply(chosen)}>
        <LayoutTemplate aria-hidden />
        Pakai template &amp; lihat hasil
      </ActionButton>
    </div>
  )
}
