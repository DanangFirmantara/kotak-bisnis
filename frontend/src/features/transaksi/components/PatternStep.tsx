import { ArrowLeft, ArrowRight, Check, Loader2, Save } from 'lucide-react'
import { ActionButton } from '@/components/common/ActionButton'
import { GlassSelect, type SelectOption } from '@/components/common/GlassSelect'
import { SectionHeader } from '@/components/common/SectionHeader'
import { FormField } from '@/components/form/FormField'
import { FIELD_INPUT_CLASS } from '@/components/form/field-styles'
import { GlassCard } from '@/components/ui/GlassCard'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import type { AttachDirection } from '@/types/receipt'
import type { ReceiptFlow } from '../useReceiptFlow'
import { PatternGroupCard } from './PatternGroupCard'
import { TemplatePicker } from './TemplatePicker'

const ATTACH_OPTIONS: SelectOption<AttachDirection>[] = [
  { value: 'previous', label: 'Ke item sebelumnya' },
  { value: 'next', label: 'Ke item berikutnya' },
]

export type PatternStepProps = Pick<
  ReceiptFlow,
  | 'groups'
  | 'mappings'
  | 'setMapping'
  | 'storeName'
  | 'setStoreName'
  | 'attach'
  | 'setAttach'
  | 'applySavedTemplate'
  | 'saveTemplate'
  | 'savingTemplate'
  | 'templateSaved'
> & {
  onBack: () => void
  onNext: () => void
}

/** Langkah 3: kelompok baris berbentuk sama → user menentukan peran baris & segmen; bisa simpan sebagai template toko. */
export function PatternStep(props: PatternStepProps) {
  const { groups, mappings, setMapping, storeName, setStoreName, attach, setAttach, onBack, onNext } = props
  const canSave = storeName.trim().length > 0 && !props.savingTemplate
  const hasItem = groups.some((g) => mappings[g.key]?.lineRole === 'item')

  return (
    <div className="flex flex-col gap-4">
      <GlassCard className="flex flex-col gap-4 p-5 sm:p-6">
        <SectionHeader
          title="Pola struk"
          subtitle="Baris dikelompokkan menurut bentuknya. Atur peran tiap kelompok — saran otomatis sudah diisi."
        />
        <TemplatePicker onApply={props.applySavedTemplate} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="pattern-store" label="Nama toko">
            <input
              id="pattern-store"
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
              placeholder="mis. Hari Hari Buaran"
              autoComplete="off"
              className={FIELD_INPUT_CLASS}
            />
          </FormField>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">Rincian &amp; diskon menempel</span>
            <GlassSelect label="Rincian dan diskon menempel ke" value={attach} options={ATTACH_OPTIONS} onChange={setAttach} className="w-full sm:w-56" />
          </div>
        </div>
      </GlassCard>

      <Stagger className="flex flex-col gap-3" stagger={0.04}>
        {groups.map((group) => {
          const mapping = mappings[group.key]
          if (!mapping) return null
          return (
            <StaggerItem key={group.key}>
              <PatternGroupCard group={group} mapping={mapping} onChange={(next) => setMapping(group.key, next)} />
            </StaggerItem>
          )
        })}
      </Stagger>

      {!hasItem && (
        <p role="status" className="px-1 text-xs font-semibold text-warning-deep">
          Belum ada kelompok berperan Item — hasil akan kosong.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <ActionButton type="button" tone="glass" onClick={onBack}>
          <ArrowLeft aria-hidden />
          Kembali
        </ActionButton>
        <ActionButton type="button" tone="glass" disabled={!canSave} onClick={props.saveTemplate}>
          {props.savingTemplate ? <Loader2 aria-hidden className="animate-spin" /> : <Save aria-hidden />}
          Simpan sebagai template
        </ActionButton>
        <ActionButton type="button" onClick={onNext}>
          Lihat hasil
          <ArrowRight aria-hidden />
        </ActionButton>
        {props.templateSaved && (
          <p role="status" className="flex items-center gap-1.5 text-xs font-semibold text-success">
            <Check aria-hidden className="size-4" />
            Template tersimpan
          </p>
        )}
      </div>
    </div>
  )
}
