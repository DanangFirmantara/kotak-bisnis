// Terapkan pola (mapping peran per kelompok baris) ke baris mentah → ParsedReceipt. Fungsi murni.
import type { AttachDirection, GroupMapping, GroupMappings, ParsedReceipt, ReceiptItem, Token } from '@/types/receipt'
import { parseReceiptDate } from './dates'
import { analyzeLine } from './groupLines'

interface DraftItem {
  code: string
  name: string
  subtotal: number
  qty: number | null
  unitPrice: number | null
  discount: number
}

interface DraftDetail {
  qty: number | null
  unitPrice: number | null
  discount: number
}

const emptyDetail = (): DraftDetail => ({ qty: null, unitPrice: null, discount: 0 })

function readDetail(tokens: readonly Token[], mapping: GroupMapping): DraftDetail {
  const detail = emptyDetail()
  tokens.forEach((token, index) => {
    const role = mapping.segments[index]
    if (token.value === null) return
    if (role === 'qty') detail.qty = Math.abs(token.value)
    else if (role === 'unitPrice') detail.unitPrice = Math.abs(token.value)
    else if (role === 'discount') detail.discount += Math.abs(token.value)
  })
  return detail
}

function readItem(tokens: readonly Token[], mapping: GroupMapping): DraftItem {
  const item: DraftItem = { code: '', name: '', subtotal: 0, qty: null, unitPrice: null, discount: 0 }
  tokens.forEach((token, index) => {
    const role = mapping.segments[index]
    if (role === 'code') item.code = token.text
    else if (role === 'name') item.name = token.text
    else if (role === 'subtotal' && token.value !== null) item.subtotal = token.value
  })
  return item
}

function mergeDetail(item: DraftItem, detail: DraftDetail): void {
  if (detail.qty !== null) item.qty = detail.qty
  if (detail.unitPrice !== null) item.unitPrice = detail.unitPrice
  item.discount += detail.discount
}

function finalizeItem(draft: DraftItem, index: number): ReceiptItem {
  const qty = draft.qty && draft.qty > 0 ? draft.qty : 1
  return {
    id: `item-${index + 1}`,
    code: draft.code,
    name: draft.name,
    qty,
    unitPrice: draft.unitPrice ?? Math.round((draft.subtotal + draft.discount) / qty),
    discount: draft.discount,
    subtotal: draft.subtotal,
  }
}

function readSummary(tokens: readonly Token[], mapping: GroupMapping, result: ParsedReceipt): void {
  tokens.forEach((token, index) => {
    switch (mapping.segments[index]) {
      case 'total':
        result.receiptTotal ??= token.value
        break
      case 'itemCount':
        result.receiptQty ??= token.value
        break
      case 'savings':
        result.savings ??= token.value === null ? null : Math.abs(token.value)
        break
      case 'paymentMethod':
        result.paymentMethod ||= token.text
        break
      case 'date':
        result.date ||= parseReceiptDate(token.text)
        break
      case 'time':
        result.time ||= token.text
        break
      default:
        break
    }
  })
}

/**
 * Baris item membuka item baru. Rincian & diskon menempel ke item sebelumnya (`attach: 'previous'`, default
 * kebanyakan toko) atau item berikutnya. Grup tanpa mapping dianggap diabaikan.
 */
export function applyTemplate(
  lines: readonly string[],
  mappings: GroupMappings,
  attach: AttachDirection = 'previous',
): ParsedReceipt {
  const result: ParsedReceipt = {
    date: '',
    time: '',
    paymentMethod: '',
    receiptTotal: null,
    receiptQty: null,
    savings: null,
    items: [],
  }
  const drafts: DraftItem[] = []
  let pending = emptyDetail()

  for (const line of lines) {
    const { tokens, key } = analyzeLine(line)
    const mapping = mappings[key]
    if (!mapping || tokens.length === 0) continue

    if (mapping.lineRole === 'item') {
      const draft = readItem(tokens, mapping)
      if (attach === 'next') {
        mergeDetail(draft, pending)
        pending = emptyDetail()
      }
      drafts.push(draft)
    } else if (mapping.lineRole === 'detail' || mapping.lineRole === 'discount') {
      const detail = readDetail(tokens, mapping)
      if (attach === 'next') {
        pending = {
          qty: detail.qty ?? pending.qty,
          unitPrice: detail.unitPrice ?? pending.unitPrice,
          discount: pending.discount + detail.discount,
        }
      } else {
        const target = drafts[drafts.length - 1]
        if (target) mergeDetail(target, detail)
      }
    } else if (mapping.lineRole === 'summary') {
      readSummary(tokens, mapping, result)
    }
  }

  result.items = drafts.map(finalizeItem)
  return result
}
