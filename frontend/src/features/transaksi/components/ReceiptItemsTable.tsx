import { Controller, useFieldArray, type UseFormReturn } from 'react-hook-form'
import { EditableTable, type EditableTableColumn } from '@/components/form/EditableTable'
import { FIELD_CELL_CLASS } from '@/components/form/field-styles'
import { MoneyInput } from '@/components/form/MoneyInput'
import { expectedSubtotal } from '@/lib/receipt'
import { cn } from '@/lib/utils'
import type { ReceiptFormValues } from '@/schemas/receipt.schema'

const COLUMNS: EditableTableColumn[] = [
  { id: 'code', header: 'Kode', width: '6.5rem' },
  { id: 'name', header: 'Nama produk', width: 'minmax(0,2fr)', fullWidthOnMobile: true },
  { id: 'qty', header: 'Qty', width: '4rem' },
  { id: 'unitPrice', header: 'Harga satuan', width: '6.5rem' },
  { id: 'discount', header: 'Diskon', width: '6rem' },
  { id: 'subtotal', header: 'Subtotal', width: '7rem' },
]

type MoneyField = 'unitPrice' | 'discount' | 'subtotal'
const MONEY_FIELDS: readonly MoneyField[] = ['unitPrice', 'discount', 'subtotal']
const isMoneyField = (id: string): id is MoneyField => MONEY_FIELDS.some((f) => f === id)

const emptyItem = (): ReceiptFormValues['items'][number] => ({
  uid: crypto.randomUUID(),
  code: '',
  name: '',
  qty: 1,
  unitPrice: 0,
  discount: 0,
  subtotal: 0,
})

export interface ReceiptItemsTableProps {
  form: UseFormReturn<ReceiptFormValues>
  /** uid item → subtotal yang diharapkan, untuk baris yang tidak cocok */
  rowIssues: Readonly<Record<string, number>>
  disabled?: boolean
}

/** Tabel item hasil baca (react-hook-form useFieldArray). Ubah qty/harga/diskon → subtotal baris dihitung ulang. */
export function ReceiptItemsTable({ form, rowIssues, disabled }: ReceiptItemsTableProps) {
  const { control, register, getValues, setValue, formState } = form
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const rows = fields.map((field) => ({ id: field.id, uid: field.uid, name: field.name }))

  /** `override`: nilai field yang baru berubah (Controller bisa belum sempat tercermin di getValues) */
  const recalcSubtotal = (index: number, override: Partial<Record<'qty' | 'unitPrice' | 'discount', number>> = {}) => {
    const row = { ...getValues(`items.${index}`), ...override }
    const value = expectedSubtotal(row)
    if (Number.isFinite(value)) setValue(`items.${index}.subtotal`, value, { shouldDirty: true })
  }

  return (
    <EditableTable
      columns={COLUMNS}
      rows={rows}
      disabled={disabled}
      addLabel="Tambah item"
      emptyMessage="Belum ada item — tambahkan manual."
      rowLabel={(row) => row.name}
      isRowFlagged={(row) => row.uid in rowIssues}
      onAdd={() => append(emptyItem())}
      onRemove={remove}
      renderCell={(columnId, _row, index) => {
        const label = COLUMNS.find((c) => c.id === columnId)?.header ?? columnId
        const rowErrors = formState.errors.items?.[index]
        if (isMoneyField(columnId)) {
          return (
            <Controller
              control={control}
              name={`items.${index}.${columnId}`}
              render={({ field }) => (
                <MoneyInput
                  {...field}
                  allowNegative={columnId === 'discount'}
                  aria-label={`${label} baris ${index + 1}`}
                  aria-invalid={rowErrors?.[columnId] ? true : undefined}
                  className={FIELD_CELL_CLASS}
                  onChange={(value) => {
                    field.onChange(value)
                    if (columnId !== 'subtotal') recalcSubtotal(index, { [columnId]: value ?? 0 })
                  }}
                />
              )}
            />
          )
        }
        if (columnId === 'qty') {
          return (
            <input
              type="number"
              inputMode="decimal"
              step="any"
              aria-label={`${label} baris ${index + 1}`}
              aria-invalid={rowErrors?.qty ? true : undefined}
              className={cn(FIELD_CELL_CLASS, 'text-right tabular-nums')}
              {...register(`items.${index}.qty`, { valueAsNumber: true, onChange: () => recalcSubtotal(index) })}
            />
          )
        }
        const textField = columnId === 'name' ? 'name' : 'code'
        return (
          <input
            type="text"
            aria-label={`${label} baris ${index + 1}`}
            aria-invalid={rowErrors?.[textField] ? true : undefined}
            autoComplete="off"
            className={FIELD_CELL_CLASS}
            {...register(`items.${index}.${textField}`)}
          />
        )
      }}
    />
  )
}
