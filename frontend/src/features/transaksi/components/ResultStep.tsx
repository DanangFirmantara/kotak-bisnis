import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CircleCheck, Loader2, Save } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ActionButton } from '@/components/common/ActionButton'
import { SectionHeader } from '@/components/common/SectionHeader'
import { FormAlert } from '@/components/form/FormAlert'
import { MoneyField } from '@/components/form/MoneyField'
import { TextField } from '@/components/form/TextField'
import { GlassCard } from '@/components/ui/GlassCard'
import { useSaveTransaction } from '@/hooks/useReceipt'
import { getErrorMessage } from '@/lib/api'
import { validateReceipt } from '@/lib/receipt'
import { receiptFormSchema, type ReceiptFormValues } from '@/schemas/receipt.schema'
import type { ParsedReceipt, ReceiptItem } from '@/types/receipt'
import { ReceiptCheck } from './ReceiptCheck'
import { ReceiptItemsTable } from './ReceiptItemsTable'
import { SpendingChartCard } from './SpendingChartCard'

export interface ResultStepProps {
  parsed: ParsedReceipt
  storeName: string
  onBack: () => void
}

const toDefaultValues = (parsed: ParsedReceipt, storeName: string): ReceiptFormValues => ({
  storeName,
  date: parsed.date,
  time: parsed.time,
  paymentMethod: parsed.paymentMethod,
  receiptTotal: parsed.receiptTotal,
  items: parsed.items.map(({ id, ...rest }) => ({ uid: id, ...rest })),
})

/** Form bisa berisi NaN sementara (input kosong) — anggap 0 untuk pengecekan agar UI tidak ikut rusak. */
const finite = (value: number) => (Number.isFinite(value) ? value : 0)

/** Langkah 4: header + tabel item editable + pengecekan terhadap total struk. Simpan = dummy (fase UI). */
export function ResultStep({ parsed, storeName, onBack }: ResultStepProps) {
  const save = useSaveTransaction()
  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: toDefaultValues(parsed, storeName),
  })
  const { register, control, handleSubmit, formState } = form
  const { errors } = formState

  const items = useWatch({ control, name: 'items' })
  const receiptTotal = useWatch({ control, name: 'receiptTotal' })

  const validation = useMemo(() => {
    const list: ReceiptItem[] = items.map((item) => ({
      id: item.uid,
      code: item.code,
      name: item.name,
      qty: finite(item.qty),
      unitPrice: finite(item.unitPrice),
      discount: finite(item.discount),
      subtotal: finite(item.subtotal),
    }))
    const total = receiptTotal !== null && Number.isFinite(receiptTotal) ? receiptTotal : null
    return validateReceipt(list, total, parsed.receiptQty)
  }, [items, receiptTotal, parsed.receiptQty])

  const chartItems = useMemo(() => items.map((i) => ({ name: i.name, subtotal: finite(i.subtotal) })), [items])

  const pending = save.isPending
  const itemsError = errors.items?.message ?? errors.items?.root?.message
  const hasFieldErrors = Object.keys(errors).length > 0

  return (
    <form noValidate onSubmit={handleSubmit((values) => save.mutate(values))} aria-busy={pending} className="flex flex-col gap-4">
      <fieldset disabled={pending} className="flex flex-col gap-4">
        <legend className="sr-only">Hasil baca struk</legend>

        <GlassCard className="flex flex-col gap-4 p-5 sm:p-6">
          <SectionHeader title="Data struk" subtitle="Periksa dan koreksi sebelum disimpan." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Nama toko" autoComplete="off" error={errors.storeName?.message} {...register('storeName')} />
            <TextField label="Metode bayar" autoComplete="off" error={errors.paymentMethod?.message} {...register('paymentMethod')} />
            <TextField label="Tanggal" type="date" error={errors.date?.message} {...register('date')} />
            <TextField label="Jam" placeholder="HH:mm" autoComplete="off" error={errors.time?.message} {...register('time')} />
            <Controller
              control={control}
              name="receiptTotal"
              render={({ field }) => <MoneyField {...field} label="Total di struk" error={errors.receiptTotal?.message} />}
            />
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <ReceiptCheck validation={validation} />
          <SpendingChartCard items={chartItems} />
        </div>

        <GlassCard className="flex flex-col gap-3 p-5 sm:p-6">
          <SectionHeader title="Item belanja" subtitle="Baris bertanda kuning: subtotal tidak sama dengan qty × harga − diskon." />
          <ReceiptItemsTable form={form} rowIssues={validation.rowIssues} disabled={pending} />
          {itemsError && <p className="text-xs font-medium text-danger-deep">{itemsError}</p>}
        </GlassCard>
      </fieldset>

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
          Kembali ke pola
        </ActionButton>
        <ActionButton type="submit" disabled={pending}>
          {pending ? <Loader2 aria-hidden className="animate-spin" /> : <Save aria-hidden />}
          Simpan transaksi
        </ActionButton>
      </div>
    </form>
  )
}
