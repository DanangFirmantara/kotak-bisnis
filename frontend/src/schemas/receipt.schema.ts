import { z } from 'zod'

const numberField = (label: string) => z.number({ error: `${label} harus berupa angka` })

export const receiptItemSchema = z.object({
  /** Kunci baris stabil (nama `id` dipakai RHF useFieldArray) */
  uid: z.string(),
  code: z.string().trim(),
  name: z.string().trim().min(1, 'Nama wajib diisi'),
  qty: numberField('Qty').positive('Qty harus lebih dari 0'),
  unitPrice: numberField('Harga').min(0, 'Harga tidak boleh negatif'),
  discount: numberField('Diskon').min(0, 'Diskon tidak boleh negatif'),
  subtotal: numberField('Subtotal'),
})

/** Form hasil baca struk (header + daftar item editable). */
export const receiptFormSchema = z.object({
  storeName: z.string().trim().min(1, 'Nama toko wajib diisi'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  time: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\d{1,2}:\d{2}(:\d{2})?$/.test(v), 'Format jam HH:mm'),
  paymentMethod: z.string().trim(),
  /** TOTAL yang tercetak di struk — pembanding hasil hitung */
  receiptTotal: z.number().nullable(),
  items: z.array(receiptItemSchema).min(1, 'Minimal satu item'),
})

export type ReceiptItemValues = z.infer<typeof receiptItemSchema>
export type ReceiptFormValues = z.infer<typeof receiptFormSchema>

/** Mode ringkas: hanya nama + subtotal net per item dan total dibayar. */
export const simpleItemSchema = z.object({
  uid: z.string(),
  code: z.string().trim(),
  name: z.string().trim().min(1, 'Nama wajib diisi'),
  subtotal: numberField('Harga').min(0, 'Harga tidak boleh negatif'),
})

export const simpleReceiptFormSchema = z.object({
  storeName: z.string().trim(),
  /** ISO yyyy-mm-dd, boleh kosong (mode ringkas tidak membaca tanggal) */
  date: z.string(),
  /** Total yang dibayar — pembanding Σ subtotal */
  total: z.number({ error: 'Total harus berupa angka' }).min(0, 'Total tidak boleh negatif').nullable(),
  items: z.array(simpleItemSchema).min(1, 'Minimal satu item'),
})

export type SimpleReceiptFormValues = z.infer<typeof simpleReceiptFormSchema>
