import { useMemo, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CircleCheck, Loader2, Save, SlidersHorizontal } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ActionButton } from '@/components/common/ActionButton'
import { SectionHeader } from '@/components/common/SectionHeader'
import { FormAlert } from '@/components/form/FormAlert'
import { MoneyField } from '@/components/form/MoneyField'
import { TextField } from '@/components/form/TextField'
import { GlassCard } from '@/components/ui/GlassCard'
import { useSaveTransaction } from '@/hooks/useReceipt'
import { getErrorMessage } from '@/lib/api'
import { validateTotals, type SimpleReceipt } from '@/lib/receipt'
import { simpleReceiptFormSchema, type SimpleReceiptFormValues } from '@/schemas/receipt.schema'
import { ReceiptCheck } from './ReceiptCheck'
import { SimpleItemsTable } from './SimpleItemsTable'
import { SpendingChartCard } from './SpendingChartCard'

export interface SimpleResultStepProps {
  simple: SimpleReceipt
  storeName: string
  /** Panel teks hasil baca (collapsible) */
  rawPanel: ReactNode
  onBack: () => void
  onSwitchToFull: () => void
}

const toDefaultValues = (simple: SimpleReceipt, storeName: string): SimpleReceiptFormValues => ({
  storeName,
  date: '',
  total: simple.total,
  items: simple.items.map((item) => ({ uid: crypto.randomUUID(), ...item })),
})

const finite = (value: number) => (Number.isFinite(value) ? value : 0)

/**
 * Langkah Hasil mode ringkas: hanya nama produk + harga net per item dan total dibayar. Status cocok / selisih
 * terhadap total, kartu grafik belanja terbesar (live dari form yang sama), teks hasil baca bisa dikoreksi.
 */
export function SimpleResultStep({ simple, storeName, rawPanel, onBack, onSwitchToFull }: SimpleResultStepProps) {
  const save = useSaveTransaction()
  const form = useForm<SimpleReceiptFormValues>({
    resolver: zodResolver(simpleReceiptFormSchema),
    defaultValues: toDefaultValues(simple, storeName),
  })
  const { register, control, handleSubmit, formState } = form
  const { errors } = formState

  const items = useWatch({ control, name: 'items' })
  const total = useWatch({ control, name: 'total' })

  const chartItems = useMemo(() => items.map((i) => ({ name: i.name, subtotal: finite(i.subtotal) })), [items])
  const validation = useMemo(() => {
    const receiptTotal = total !== null && Number.isFinite(total) ? total : null
    const check = validateTotals(
      items.map((i) => finite(i.subtotal)),
      receiptTotal,
    )
    return {
      ...check,
      receiptTotal,
      computedQty: items.length,
      receiptQty: null,
      qtyMatches: null,
      rowIssues: {},
    }
  }, [items, total])

  const pending = save.isPending
  const itemsError = errors.items?.message ?? errors.items?.root?.message
  const hasFieldErrors = Object.keys(errors).length > 0

  return (
    <form noValidate onSubmit={handleSubmit((values) => save.mutate(values))} aria-busy={pending} className="flex flex-col gap-4">
      <fieldset disabled={pending} className="flex flex-col gap-4">
        <legend className="sr-only">Hasil baca struk (ringkas)</legend>

        <GlassCard className="flex flex-col gap-4 p-5 sm:p-6">
          <SectionHeader title="Total belanja" subtitle="Total yang dibayar dibaca dari baris TOTAL / metode bayar di struk." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Controller
              control={control}
              name="total"
              render={({ field }) => <MoneyField {...field} label="Total dibayar" error={errors.total?.message} />}
            />
            <TextField label="Nama toko (opsional)" autoComplete="off" error={errors.storeName?.message} {...register('storeName')} />
            <TextField label="Tanggal (opsional)" type="date" error={errors.date?.message} {...register('date')} />
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <ReceiptCheck validation={validation} showQty={false} />
          <SpendingChartCard items={chartItems} />
        </div>

        <GlassCard className="flex flex-col gap-3 p-5 sm:p-6">
          <SectionHeader title="Item belanja" subtitle="Nama produk dan harga net (sudah termasuk diskon). Koreksi seperlunya." />
          <SimpleItemsTable form={form} disabled={pending} />
          {itemsError && <p className="text-xs font-medium text-danger-deep">{itemsError}</p>}
        </GlassCard>
      </fieldset>

      {rawPanel}

      <FormAlert message={hasFieldErrors ? 'Periksa kolom yang ditandai merah, lalu simpan lagi.' : null} />
      <FormAlert message={save.isError ? getErrorMessage(save.error, 'Gagal menyimpan transaksi.') : null} />
      {save.isSuccess && (
        <p role="status" className="flex items-center gap-2 rounded-2xl border border-success/30 bg-success-soft px-4 py-3 text-sm font-medium text-ink">
          <CircleCheck aria-hidden strokeWidth={1.8} className="size-4 shrink-0 text-success" />
          Transaksi dicatat (dummy — belum disimpan ke database).
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <ActionButton type="button" tone="glass" disabled={pending} onClick={onBack}>
          <ArrowLeft aria-hidden />
          Ganti foto
        </ActionButton>
        <ActionButton type="button" tone="glass" disabled={pending} onClick={onSwitchToFull}>
          <SlidersHorizontal aria-hidden />
          Mode lengkap (qty, diskon)
        </ActionButton>
        <ActionButton type="submit" disabled={pending}>
          {pending ? <Loader2 aria-hidden className="animate-spin" /> : <Save aria-hidden />}
          Simpan transaksi
        </ActionButton>
      </div>
    </form>
  )
}
