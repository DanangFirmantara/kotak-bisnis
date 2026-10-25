// Cek hasil baca struk: total hitung vs total struk, qty vs "N ITEMS", dan baris yang hitungannya tidak cocok.
import type { ReceiptItem, ReceiptValidation } from '@/types/receipt'

/** Selisih ≤ 1 rupiah dianggap pembulatan */
const TOLERANCE = 1

/** qty × harga satuan − diskon */
export function expectedSubtotal(item: Pick<ReceiptItem, 'qty' | 'unitPrice' | 'discount'>): number {
  return Math.round(item.qty * item.unitPrice - item.discount)
}

export function validateReceipt(
  items: readonly ReceiptItem[],
  receiptTotal: number | null,
  receiptQty: number | null,
): ReceiptValidation {
  const computedTotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const computedQty = items.reduce((sum, item) => sum + item.qty, 0)
  const difference = receiptTotal === null ? null : computedTotal - receiptTotal

  const rowIssues: Record<string, number> = {}
  for (const item of items) {
    const expected = expectedSubtotal(item)
    if (Math.abs(expected - item.subtotal) > TOLERANCE) rowIssues[item.id] = expected
  }

  return {
    computedTotal,
    receiptTotal,
    difference,
    totalMatches: difference !== null && Math.abs(difference) <= TOLERANCE,
    computedQty,
    receiptQty,
    qtyMatches: receiptQty === null ? null : computedQty === receiptQty,
    rowIssues,
  }
}

export interface TotalCheck {
  computedTotal: number
  difference: number | null
  totalMatches: boolean
}

/** Mode ringkas: Σ subtotal item vs total yang dibayar (tanpa qty / rincian baris). */
export function validateTotals(subtotals: readonly number[], receiptTotal: number | null): TotalCheck {
  const computedTotal = subtotals.reduce((sum, value) => sum + value, 0)
  const difference = receiptTotal === null ? null : computedTotal - receiptTotal
  return { computedTotal, difference, totalMatches: difference !== null && Math.abs(difference) <= TOLERANCE }
}
