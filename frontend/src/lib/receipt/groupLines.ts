// Kelompokkan baris struk berdasarkan signature bentuk (urutan jenis token) + kata kunci khusus.
import type { LineGroup, Token, TokenType } from '@/types/receipt'
import { tokenize } from './tokenize'

/**
 * Kata kunci yang membuat baris berbentuk sama berbeda artinya (mis. "CODE TEXT MONEY" = item, tapi juga
 * "00000305976 Debit QRIS 1,050,226"). Hanya dicari di segmen TEXT, kata utuh.
 */
const KEYWORD_RE = /\b(disc\w*|diskon|orig|items?|total|debit|kredit|credit|qris|tunai|cash|menghemat|hemat|kembali|ppn)\b/i

const KEYWORD_ALIAS: Record<string, string> = {
  diskon: 'disc',
  item: 'items',
  credit: 'kredit',
  cash: 'tunai',
  hemat: 'menghemat',
}

function normalizeKeyword(raw: string): string {
  const word = raw.toLowerCase()
  if (word.startsWith('disc')) return 'disc'
  return KEYWORD_ALIAS[word] ?? word
}

export function findKeyword(tokens: readonly Token[]): string | null {
  for (const token of tokens) {
    if (token.type !== 'TEXT') continue
    const match = KEYWORD_RE.exec(token.text)
    if (match?.[1]) return normalizeKeyword(match[1])
  }
  return null
}

export interface AnalyzedLine {
  tokens: Token[]
  signature: TokenType[]
  keyword: string | null
  /** Kunci kelompok: "TEXT NUM MONEY #disc" */
  key: string
}

export function analyzeLine(line: string): AnalyzedLine {
  const tokens = tokenize(line)
  const signature = tokens.map((t) => t.type)
  const keyword = findKeyword(tokens)
  const key = `${signature.join(' ')}${keyword ? ` #${keyword}` : ''}`
  return { tokens, signature, keyword, key }
}

const MAX_SAMPLES = 3

/** Kelompok berurutan sesuai kemunculan pertama. Baris tanpa token (garis pemisah) dilewati. */
export function groupLines(lines: readonly string[]): LineGroup[] {
  const groups = new Map<string, LineGroup>()
  for (const line of lines) {
    const analyzed = analyzeLine(line)
    if (analyzed.signature.length === 0) continue
    const existing = groups.get(analyzed.key)
    if (existing) {
      existing.count++
      if (existing.samples.length < MAX_SAMPLES) existing.samples.push(line)
    } else {
      groups.set(analyzed.key, {
        key: analyzed.key,
        signature: analyzed.signature,
        keyword: analyzed.keyword,
        count: 1,
        samples: [line],
      })
    }
  }
  return [...groups.values()]
}
