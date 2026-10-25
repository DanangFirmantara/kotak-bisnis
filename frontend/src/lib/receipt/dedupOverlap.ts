// Gabung baris dari beberapa foto struk dan buang bagian yang tumpang tindih (akhir foto N ≈ awal foto N+1).
import { lineSimilarity, normalizeForCompare } from './similarity'

/** Ambang kemiripan satu baris (OCR dua foto boleh beda sedikit) */
const LINE_MATCH = 0.82
/** Minimal porsi baris yang cocok dalam satu blok overlap */
const BLOCK_MATCH = 0.8
/** Overlap terpendek yang dianggap nyata (mencegah kebetulan 1–2 baris sama) */
const MIN_OVERLAP = 3

/** Cadangan untuk hasil OCR berantakan: baris "jangkar" panjang & mirip dari kedua foto, harus berurutan */
const ANCHOR_MIN_LENGTH = 12
const ANCHOR_MATCH = 0.85
const MIN_ANCHORS = 3
/** Jangkar terakhir harus di ujung `prev`, jangkar pertama di paruh awal `next` */
const PREV_TAIL_RATIO = 0.35
const NEXT_HEAD_RATIO = 0.5

/** Panjang rangkaian terpanjang (i naik, j naik) dari pasangan jangkar — pasangan sudah urut menurut j. */
function longestIncreasing(pairs: readonly { i: number; j: number }[]): { i: number; j: number }[] {
  const best: { i: number; j: number }[][] = []
  pairs.forEach((pair, index) => {
    let chain: { i: number; j: number }[] = []
    for (let k = 0; k < index; k++) {
      const candidate = best[k] ?? []
      const tail = candidate[candidate.length - 1]
      if (tail && tail.i < pair.i && candidate.length > chain.length) chain = candidate
    }
    best[index] = [...chain, pair]
  })
  return best.reduce<{ i: number; j: number }[]>((top, chain) => (chain.length > top.length ? chain : top), [])
}

/** Overlap lewat jangkar: tahan terhadap OCR yang memecah / menggabung baris berbeda di tiap foto. */
function findAnchoredOverlap(prev: readonly string[], next: readonly string[]): number {
  const prevNorm = prev.map(normalizeForCompare)
  const pairs: { i: number; j: number }[] = []
  next.forEach((line, j) => {
    const normalized = normalizeForCompare(line)
    if (normalized.length < ANCHOR_MIN_LENGTH) return
    let bestIndex = -1
    let bestScore = ANCHOR_MATCH
    prev.forEach((candidate, i) => {
      if ((prevNorm[i]?.length ?? 0) < ANCHOR_MIN_LENGTH) return
      const score = lineSimilarity(candidate, line)
      if (score >= bestScore) {
        bestScore = score
        bestIndex = i
      }
    })
    if (bestIndex >= 0) pairs.push({ i: bestIndex, j })
  })
  const chain = longestIncreasing(pairs)
  const first = chain[0]
  const last = chain[chain.length - 1]
  if (!first || !last || chain.length < MIN_ANCHORS) return 0
  const tailOk = last.i >= prev.length - Math.max(5, Math.ceil(prev.length * PREV_TAIL_RATIO))
  const headOk = first.j <= Math.ceil(next.length * NEXT_HEAD_RATIO)
  return tailOk && headOk ? last.j + 1 : 0
}

/** Jumlah baris awal `next` yang merupakan ulangan dari akhir `prev` (0 = tidak ada overlap). */
export function findOverlap(prev: readonly string[], next: readonly string[]): number {
  return findPositionalOverlap(prev, next) || findAnchoredOverlap(prev, next)
}

function findPositionalOverlap(prev: readonly string[], next: readonly string[]): number {
  const maxK = Math.min(prev.length, next.length)
  for (let k = maxK; k >= MIN_OVERLAP; k--) {
    const allowedMiss = Math.floor(k * (1 - BLOCK_MATCH))
    let miss = 0
    for (let i = 0; i < k && miss <= allowedMiss; i++) {
      if (lineSimilarity(prev[prev.length - k + i] ?? '', next[i] ?? '') < LINE_MATCH) miss++
    }
    if (miss <= allowedMiss) return k
  }
  return 0
}

export interface PageMerge {
  /** Baris halaman ini yang dipertahankan */
  kept: string[]
  /** Baris awal halaman ini yang dibuang karena duplikat dari halaman sebelumnya */
  removed: string[]
}

export interface MergeResult {
  lines: string[]
  pages: PageMerge[]
  removedCount: number
}

const cleanLines = (lines: readonly string[]) => lines.map((l) => l.trim()).filter(Boolean)

/**
 * `removeOverlap=false` → sekadar menyambung. Overlap dihitung terhadap halaman asli sebelumnya
 * (bukan hasil gabungan), jadi tiap sambungan diperlakukan sendiri.
 */
export function mergeReceiptPages(pages: readonly (readonly string[])[], removeOverlap: boolean): MergeResult {
  const cleaned = pages.map(cleanLines)
  const merged: PageMerge[] = cleaned.map((lines, index) => {
    const previous = cleaned[index - 1]
    const overlap = removeOverlap && previous ? findOverlap(previous, lines) : 0
    return { kept: lines.slice(overlap), removed: lines.slice(0, overlap) }
  })
  return {
    lines: merged.flatMap((p) => p.kept),
    pages: merged,
    removedCount: merged.reduce((sum, p) => sum + p.removed.length, 0),
  }
}
