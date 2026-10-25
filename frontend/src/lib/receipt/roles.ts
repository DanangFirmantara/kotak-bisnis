// Peran baris & segmen struk: pilihan, label, dan saran otomatis. Fungsi murni.
import type { GroupMapping, GroupMappings, LineGroup, LineRole, SegmentRole, TokenType } from '@/types/receipt'

export const LINE_ROLES: readonly LineRole[] = ['item', 'detail', 'discount', 'summary', 'ignore']

export const LINE_ROLE_LABEL: Record<LineRole, string> = {
  item: 'Item',
  detail: 'Rincian qty × harga',
  discount: 'Diskon',
  summary: 'Ringkasan',
  ignore: 'Abaikan',
}

/** Peran segmen yang boleh dipilih untuk tiap peran baris. */
export const SEGMENT_ROLES_BY_LINE_ROLE: Record<LineRole, readonly SegmentRole[]> = {
  item: ['code', 'name', 'subtotal', 'ignore'],
  detail: ['qty', 'unitPrice', 'ignore'],
  discount: ['discount', 'ignore'],
  summary: ['total', 'itemCount', 'paymentMethod', 'savings', 'date', 'time', 'ignore'],
  ignore: ['ignore'],
}

export const SEGMENT_ROLE_LABEL: Record<SegmentRole, string> = {
  code: 'Kode',
  name: 'Nama produk',
  subtotal: 'Subtotal (net)',
  qty: 'Qty',
  unitPrice: 'Harga satuan',
  discount: 'Nominal diskon',
  total: 'Total struk',
  itemCount: 'Jumlah unit',
  paymentMethod: 'Metode bayar',
  savings: 'Total hemat',
  date: 'Tanggal',
  time: 'Jam',
  ignore: 'Abaikan',
}

const PAYMENT_KEYWORDS = new Set(['debit', 'kredit', 'qris', 'tunai'])

function itemSegment(type: TokenType, index: number, signature: readonly TokenType[]): SegmentRole {
  if (type === 'CODE' && index === signature.indexOf('CODE')) return 'code'
  if (type === 'TEXT' && index === signature.indexOf('TEXT')) return 'name'
  if (type === 'MONEY' && index === signature.lastIndexOf('MONEY')) return 'subtotal'
  return 'ignore'
}

function detailSegment(type: TokenType, index: number, signature: readonly TokenType[]): SegmentRole {
  if (type === 'NUM' && signature.includes('AT') && index === signature.indexOf('NUM')) return 'qty'
  if (type === 'MONEY' && index === signature.lastIndexOf('MONEY')) return 'unitPrice'
  return 'ignore'
}

function summarySegment(
  type: TokenType,
  index: number,
  signature: readonly TokenType[],
  keyword: string | null,
): SegmentRole {
  if (type === 'DATE') return 'date'
  if (type === 'TIME') return 'time'
  if (keyword === 'total' || keyword === 'items') {
    if (type === 'MONEY' && index === signature.lastIndexOf('MONEY')) return 'total'
    if (type === 'NUM' && index === signature.indexOf('NUM')) return 'itemCount'
  }
  if (keyword && PAYMENT_KEYWORDS.has(keyword) && type === 'TEXT') return 'paymentMethod'
  if (keyword === 'menghemat' && type === 'MONEY') return 'savings'
  return 'ignore'
}

/** Peran tiap segmen untuk peran baris tertentu (dipakai saran awal & saat user mengganti peran baris). */
export function defaultSegments(
  lineRole: LineRole,
  signature: readonly TokenType[],
  keyword: string | null,
): SegmentRole[] {
  return signature.map((type, index): SegmentRole => {
    switch (lineRole) {
      case 'item':
        return itemSegment(type, index, signature)
      case 'detail':
        return detailSegment(type, index, signature)
      case 'discount':
        return type === 'MONEY' && index === signature.lastIndexOf('MONEY') ? 'discount' : 'ignore'
      case 'summary':
        return summarySegment(type, index, signature, keyword)
      case 'ignore':
        return 'ignore'
    }
  })
}

function suggestLineRole({ signature, keyword }: Pick<LineGroup, 'signature' | 'keyword'>): LineRole {
  if (keyword === 'disc') return 'discount'
  if (keyword === 'orig') return 'detail'
  if (keyword === 'total' || keyword === 'items' || keyword === 'menghemat') return 'summary'
  if (keyword && PAYMENT_KEYWORDS.has(keyword)) return 'summary'
  if (signature.includes('DATE') || signature.includes('TIME')) return 'summary'
  if (signature.length === 3 && signature[0] === 'NUM' && signature[1] === 'AT' && signature[2] === 'MONEY') {
    return 'detail'
  }
  if (signature.length === 3 && signature[0] === 'CODE' && signature[1] === 'TEXT' && signature[2] === 'MONEY') {
    return 'item'
  }
  return 'ignore'
}

export function suggestMapping(group: Pick<LineGroup, 'signature' | 'keyword'>): GroupMapping {
  const lineRole = suggestLineRole(group)
  return { lineRole, segments: defaultSegments(lineRole, group.signature, group.keyword) }
}

/** Saran peran untuk semua kelompok; `existing` (mis. dari template) menang atas saran. */
export function suggestMappings(groups: readonly LineGroup[], existing: GroupMappings = {}): GroupMappings {
  const result: GroupMappings = {}
  for (const group of groups) result[group.key] = existing[group.key] ?? suggestMapping(group)
  return result
}
