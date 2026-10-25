// Mode ringkas: dari baris mentah, ambil HANYA daftar item {kode?, nama, subtotal net} + total dibayar.
// Rincian "1 @ harga", diskon, "orig", header toko, dan footer diabaikan (subtotal net sudah termasuk diskon).
// Toleran noise OCR: kode boleh hilang / salah digit, nominal boleh kehilangan pemisah ribuan. Fungsi murni.
import type { Token } from '@/types/receipt'
import { analyzeLine } from './groupLines'

export interface SimpleItem {
  code: string
  name: string
  subtotal: number
}

export interface SimpleReceipt {
  items: SimpleItem[]
  /** Total yang dibayar; null bila tidak ditemukan */
  total: number | null
  paymentMethod: string
}

const MIN_NAME_LETTERS = 3
/** Nominal terbesar yang masuk akal untuk satu item belanja (menyaring angka salah baca yang menggelembung) */
const MAX_ITEM_AMOUNT = 50_000_000
const PAYMENT_KEYWORDS = new Set(['debit', 'kredit', 'qris', 'tunai'])
/** Footer barcode struk: "00008-176053-251026-006758-1,050,226" — nominal terakhir = total */
const BARCODE_TOTAL_RE = /^\S*\d{4,}-\d{4,}-\d{4,}\S*-(\d{1,3}(?:[.,]\d{3})+)\s*$/

const letterCount = (text: string) => text.match(/\p{L}/gu)?.length ?? 0

/** Nominal di ujung baris: token MONEY positif, atau angka polos 4–7 digit (koma ribuan hilang) setelah teks. */
function trailingAmount(tokens: readonly Token[]): number | null {
  const last = tokens[tokens.length - 1]
  const before = tokens[tokens.length - 2]
  if (!last) return null
  if (last.type === 'MONEY') return last.value !== null && last.value > 0 && !last.text.startsWith('-') ? last.value : null
  if (last.type === 'CODE' && before?.type === 'TEXT' && /^\d{4,7}$/.test(last.text)) return Number(last.text)
  return null
}

function parseItem(line: string): SimpleItem | null {
  const { tokens, keyword, signature } = analyzeLine(line)
  if (keyword) return null
  const amount = trailingAmount(tokens)
  if (amount === null || amount > MAX_ITEM_AMOUNT) return null
  // Rincian "1 @ 58,660" tidak punya nama; item wajib punya segmen teks dengan huruf cukup
  const nameToken = tokens.find((t) => t.type === 'TEXT' && letterCount(t.text) >= MIN_NAME_LETTERS)
  if (!nameToken || signature.includes('AT')) return null
  const code = tokens[0]?.type === 'CODE' && tokens[0] !== tokens[tokens.length - 1] ? tokens[0].text : ''
  return { code, name: nameToken.text, subtotal: amount }
}

/** Suara untuk total: baris berkata kunci TOTAL / metode bayar, plus footer barcode. */
function collectTotalVotes(lines: readonly string[]): { totals: number[]; payments: number[]; method: string } {
  const totals: number[] = []
  const payments: number[] = []
  let method = ''
  for (const line of lines) {
    const barcode = BARCODE_TOTAL_RE.exec(line.trim())
    if (barcode?.[1]) {
      const value = analyzeLine(barcode[1]).tokens[0]?.value
      if (value) totals.push(value)
      continue
    }
    const { tokens, keyword } = analyzeLine(line)
    const isTotal = keyword === 'total'
    const isPayment = keyword !== null && PAYMENT_KEYWORDS.has(keyword)
    if (!isTotal && !isPayment) continue
    const amount = tokens.filter((t) => t.type === 'MONEY' && t.value !== null && t.value > 0).at(-1)?.value
    if (amount) (isTotal ? totals : payments).push(amount)
    if (isPayment && !method) method = tokens.find((t) => t.type === 'TEXT')?.text ?? ''
  }
  return { totals, payments, method }
}

/** Nilai yang paling sering muncul (seri → yang lebih besar): beberapa baris menyebut total yang sama, satu salah baca tidak menang. */
function mostCommon(values: readonly number[]): number | null {
  const counts = new Map<number, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  let best: number | null = null
  for (const [value, count] of counts) {
    const bestCount = best === null ? 0 : (counts.get(best) ?? 0)
    if (count > bestCount || (count === bestCount && best !== null && value > best)) best = value
  }
  return best
}

/** Cadangan: nominal terbesar di sepertiga bawah struk. */
function largestInBottomThird(lines: readonly string[]): number | null {
  const bottom = lines.slice(Math.floor((lines.length * 2) / 3))
  const amounts = bottom.flatMap((line) =>
    analyzeLine(line)
      .tokens.filter((t) => t.type === 'MONEY' && t.value !== null && t.value > 0)
      .map((t) => t.value ?? 0),
  )
  return amounts.length > 0 ? Math.max(...amounts) : null
}

/** Baris pembawa total / pembayaran (menempelkan hasil OCR footer ke teks utama tanpa menggandakan item). */
export function isTotalLine(line: string): boolean {
  if (BARCODE_TOTAL_RE.test(line.trim())) return true
  const { keyword } = analyzeLine(line)
  return keyword === 'total' || keyword === 'items' || (keyword !== null && PAYMENT_KEYWORDS.has(keyword))
}

export function extractSimple(lines: readonly string[]): SimpleReceipt {
  const items = lines.map(parseItem).filter((item): item is SimpleItem => item !== null)
  const { totals, payments, method } = collectTotalVotes(lines)
  // Baris TOTAL + metode bayar saling menguatkan (nilai sama) — gabungkan sebagai suara
  const total = mostCommon([...totals, ...payments]) ?? largestInBottomThird(lines)
  return { items, total, paymentMethod: method }
}
