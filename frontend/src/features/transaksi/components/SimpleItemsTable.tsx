import { Controller, useFieldArray, type UseFormReturn } from 'react-hook-form'
import { EditableTable, type EditableTableColumn } from '@/components/form/EditableTable'
import { FIELD_CELL_CLASS } from '@/components/form/field-styles'
import { MoneyInput } from '@/components/form/MoneyInput'
import type { SimpleReceiptFormValues } from '@/schemas/receipt.schema'

const COLUMNS: EditableTableColumn[] = [
  { id: 'name', header: 'Nama produk', width: 'minmax(0,1fr)', fullWidthOnMobile: true },
  { id: 'subtotal', header: 'Harga (net)', width: '9rem', fullWidthOnMobile: true },
]

export interface SimpleItemsTableProps {
  form: UseFormReturn<SimpleReceiptFormValues>
  disabled?: boolean
}

/** Tabel ringkas: nama produk + harga net per item (sudah termasuk diskon). Tambah / hapus baris manual. */
export function SimpleItemsTable({ form, disabled }: SimpleItemsTableProps) {
  const { control, register, formState } = form
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const rows = fields.map((field) => ({ id: field.id, name: field.name }))

  return (
    <EditableTable
      columns={COLUMNS}
      rows={rows}
      disabled={disabled}
      addLabel="Tambah item"
      emptyMessage="Belum ada item — tambahkan manual."
      rowLabel={(row) => row.name}
      onAdd={() => append({ uid: crypto.randomUUID(), code: '', name: '', subtotal: 0 })}
      onRemove={remove}
      renderCell={(columnId, _row, index) => {
        const errors = formState.errors.items?.[index]
        if (columnId === 'subtotal') {
          return (
            <Controller
              control={control}
              name={`items.${index}.subtotal`}
              render={({ field }) => (
                <MoneyInput
                  {...field}
                  aria-label={`Harga baris ${index + 1}`}
                  aria-invalid={errors?.subtotal ? true : undefined}
                  className={FIELD_CELL_CLASS}
                />
              )}
            />
          )
        }
        return (
          <input
            type="text"
            autoComplete="off"
            aria-label={`Nama produk baris ${index + 1}`}
            aria-invalid={errors?.name ? true : undefined}
            className={FIELD_CELL_CLASS}
            {...register(`items.${index}.name`)}
          />
        )
      }}
    />
  )
}
