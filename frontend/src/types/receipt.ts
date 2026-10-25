// Tipe fitur Transaksi — baca struk belanja. Murni data, tanpa logika (logika di src/lib/receipt/).

/** Jenis token hasil tokenisasi satu baris struk. */
export type TokenType = 'CODE' | 'MONEY' | 'NUM' | 'AT' | 'PCT' | 'DATE' | 'TIME' | 'TEXT'

export interface Token {
  type: TokenType
  /** Teks asli (setelah koreksi noise OCR) */
  text: string
  /** Nilai numerik untuk MONEY / NUM / PCT (MONEY bisa negatif), selain itu null */
  value: number | null
}

/** Hasil baca satu foto: baris-baris teks apa adanya (urut atas → bawah). */
export interface ReceiptPage {
  fileName: string
  lines: string[]
}

/** Keluaran mesin baca (mock sekarang, Tesseract.js nanti) — kontrak tetap. */
export interface RawReceipt {
  pages: ReceiptPage[]
}

/** Progres baca: `page` index foto (0-based), `ratio` 0..1 untuk foto itu. */
export interface ReadProgress {
  page: number
  ratio: number
  /** `init` = mesin / model bahasa sedang disiapkan, `read` = membaca teks foto (kosong = `read`) */
  phase?: 'init' | 'read'
}

export interface ReadReceiptOptions {
  onProgress?: (progress: ReadProgress) => void
}

/** Peran satu baris struk. */
export type LineRole = 'item' | 'detail' | 'discount' | 'summary' | 'ignore'

/** Peran satu segmen (token) di dalam baris. */
export type SegmentRole =
  | 'code'
  | 'name'
  | 'subtotal'
  | 'qty'
  | 'unitPrice'
  | 'discount'
  | 'total'
  | 'itemCount'
  | 'paymentMethod'
  | 'savings'
  | 'date'
  | 'time'
  | 'ignore'

/** Rincian & diskon menempel ke item sebelumnya (umum) atau berikutnya. */
export type AttachDirection = 'previous' | 'next'

/** Satu kelompok baris dengan bentuk (signature) yang sama. */
export interface LineGroup {
  /** Kunci unik: signature + keyword, mis. "TEXT NUM MONEY #disc" */
  key: string
  signature: TokenType[]
  /** Kata kunci khusus (disc, total, debit, ...) yang membedakan kelompok berbentuk sama */
  keyword: string | null
  count: number
  /** 1–3 contoh baris asli */
  samples: string[]
}

export interface GroupMapping {
  lineRole: LineRole
  /** Sejajar dengan `LineGroup.signature` */
  segments: SegmentRole[]
}

export type GroupMappings = Record<string, GroupMapping>

export interface ReceiptTemplate {
  id: string
  storeName: string
  attach: AttachDirection
  mappings: GroupMappings
}

export interface SaveTemplateInput {
  storeName: string
  attach: AttachDirection
  mappings: GroupMappings
}

export interface ReceiptItem {
  id: string
  code: string
  name: string
  qty: number
  unitPrice: number
  /** Nominal diskon positif */
  discount: number
  /** Harga net baris (sesuai struk) */
  subtotal: number
}

/** Hasil penerapan pola ke baris mentah (sebelum diedit user). */
export interface ParsedReceipt {
  /** ISO yyyy-mm-dd, kosong bila tidak ditemukan */
  date: string
  /** "HH:mm:ss" / "HH:mm", kosong bila tidak ditemukan */
  time: string
  paymentMethod: string
  /** TOTAL di struk */
  receiptTotal: number | null
  /** Jumlah unit ("58 ITEMS") */
  receiptQty: number | null
  savings: number | null
  items: ReceiptItem[]
}

export interface ReceiptValidation {
  computedTotal: number
  receiptTotal: number | null
  /** computedTotal − receiptTotal (null bila total struk tidak ada) */
  difference: number | null
  totalMatches: boolean
  computedQty: number
  receiptQty: number | null
  qtyMatches: boolean | null
  /** id item → subtotal yang diharapkan (qty × harga − diskon) untuk baris yang tidak cocok */
  rowIssues: Record<string, number>
}

export interface SaveTransactionResult {
  id: string
}
