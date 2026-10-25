// Tokenizer baris struk — fungsi murni (tanpa React), toleran noise OCR.
// Nominal: pemisah "," atau ".", spasi nyasar di dalam angka ("1,050, 226"), minus terpisah ("- 2,930"),
// huruf mirip angka (O→0, l/I→1) hanya pada kata yang sudah berbentuk angka.
import type { Token, TokenType } from '@/types/receipt'

const MONEY_RE = /^-?\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?$/
const SIGNED_INT_RE = /^-\d{3,}$/
const PCT_RE = /^[-+]?\d+(?:[.,]\d+)?%$/
const DATE_RE = /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/
const TIME_RE = /^\d{1,2}:\d{2}(?::\d{2})?$/
const CODE_RE = /^\d{4,}$/
const INT_RE = /^\d{1,4}$/
const DECIMAL_RE = /^\d+[.,]\d{1,2}$/
const PUNCTUATION_ONLY_RE = /^[^\p{L}\p{N}@]+$/u
const NUMERIC_LOOKALIKE_RE = /^[-+]?[\dOoIl|][\dOoIl|,.\-:/%]*$/

/** "1,050,226" / "1.050.226" / "-2,930" / "7,50" → angka (desimal 1–2 digit di ujung dianggap pecahan). */
export function parseAmount(text: string): number | null {
  const negative = text.startsWith('-')
  const body = text.replace(/^[-+]/, '').replace(/%$/, '')
  if (!/^\d[\d.,]*$/.test(body)) return null
  const decimal = /^(.*?)[.,](\d{1,2})$/.exec(body)
  const integerPart = (decimal ? (decimal[1] ?? '') : body).replace(/[.,]/g, '')
  const value = Number(decimal ? `${integerPart}.${decimal[2] ?? '0'}` : integerPart)
  if (!Number.isFinite(value)) return null
  return negative ? -value : value
}

/** Bersihkan noise sebelum dipecah per kata. */
export function normalizeLine(raw: string): string {
  return raw
    .replace(/[−–—]/g, '-')
    .replace(/\(\s*-\s*\)/g, ' ') // "(-)"
    .replace(/[()[\]{}]/g, ' ')
    .replace(/(\d)\s*@\s*(\d)/g, '$1 @ $2')
    .replace(/(\d[.,])\s+(\d{3})(?!\d)/g, '$1$2') // "1,050, 226"
    .replace(/(\d)\s+([.,]\d{3})(?!\d)/g, '$1$2') // "1 ,050"
    .replace(/(^|\s)-\s+(?=\d)/g, '$1-') // "- 2,930"
    .replace(/^(\d{1,2})\s+\S\s+(-?\d{1,3}(?:[.,]\d{3})+)$/, '$1 @ $2') // "1 6 18,810": '@' salah baca di baris rincian
    .replace(/\s+/g, ' ')
    .trim()
}

function classifyWord(word: string): TokenType {
  if (word === '@') return 'AT'
  if (DATE_RE.test(word)) return 'DATE'
  if (TIME_RE.test(word)) return 'TIME'
  if (PCT_RE.test(word)) return 'PCT'
  if (MONEY_RE.test(word) || SIGNED_INT_RE.test(word)) return 'MONEY'
  if (CODE_RE.test(word)) return 'CODE'
  if (INT_RE.test(word) || DECIMAL_RE.test(word)) return 'NUM'
  return 'TEXT'
}

/** O→0, l/I/|→1 hanya bila kata berbentuk angka (ada ≥1 digit asli) dan hasilnya benar-benar angka. */
function fixOcrDigits(word: string): string {
  if (!/\d/.test(word) || !NUMERIC_LOOKALIKE_RE.test(word)) return word
  const fixed = word.replace(/[Oo]/g, '0').replace(/[Il|]/g, '1')
  return fixed !== word && classifyWord(fixed) !== 'TEXT' ? fixed : word
}

interface Word {
  text: string
  type: TokenType
}

function toWords(line: string): Word[] {
  return normalizeLine(line)
    .split(' ')
    .filter((w) => w && !PUNCTUATION_ONLY_RE.test(w))
    .map((w) => {
      const text = fixOcrDigits(w)
      return { text, type: classifyWord(text) }
    })
}

/**
 * Baris berbentuk "KODE ... NOMINAL" (mis. item): semua kata di tengah = satu segmen TEXT, supaya angka di nama produk
 * ("GENTLE GEN 700 PG", "MALIA BAKSO SAPI 250") tidak memecah pola. Di baris lain, angka yang diapit kata
 * ("LIFEBUOY 800 LF") ikut jadi teks.
 */
function absorbNameWords(words: Word[]): Word[] {
  const first = words[0]
  const last = words[words.length - 1]
  // Nominal tanpa pemisah ribuan (OCR menghilangkan koma: "16000") di ujung baris berkode tetap dianggap nominal
  const trailingAmount = last && last.type !== 'MONEY' && /^\d{4,7}$/.test(last.text) ? ({ ...last, type: 'MONEY' } as const) : last
  if (words.length >= 3 && first?.type === 'CODE' && trailingAmount?.type === 'MONEY') {
    const name = words
      .slice(1, -1)
      .map((w) => w.text)
      .join(' ')
    return [first, { text: name, type: 'TEXT' }, trailingAmount]
  }
  return words.map((w, i) =>
    w.type === 'NUM' && words[i - 1]?.type === 'TEXT' && words[i + 1]?.type === 'TEXT'
      ? { text: w.text, type: 'TEXT' as const }
      : w,
  )
}

function toToken(word: Word): Token {
  const numeric = word.type === 'MONEY' || word.type === 'NUM' || word.type === 'PCT'
  return { type: word.type, text: word.text, value: numeric ? parseAmount(word.text) : null }
}

/** Satu baris → token. TEXT berurutan digabung jadi satu segmen. Baris kosong / hanya pemisah → []. */
export function tokenize(line: string): Token[] {
  const tokens: Token[] = []
  for (const word of absorbNameWords(toWords(line))) {
    const last = tokens[tokens.length - 1]
    if (word.type === 'TEXT' && last?.type === 'TEXT') {
      tokens[tokens.length - 1] = { ...last, text: `${last.text} ${word.text}` }
    } else {
      tokens.push(toToken(word))
    }
  }
  return tokens
}
