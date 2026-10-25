// Kemiripan teks untuk mencocokkan baris dari dua foto yang dibaca OCR (boleh beda sedikit).

/** Huruf kecil, tanpa spasi/tanda baca — hanya huruf & angka. */
export function normalizeForCompare(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
}

/** Jarak Levenshtein (dua baris memori). */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const curr = [i]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min((prev[j] ?? 0) + 1, (curr[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost)
    }
    prev = curr
  }
  return prev[b.length] ?? 0
}

/** 0..1 (1 = sama setelah normalisasi). */
export function lineSimilarity(a: string, b: string): number {
  const x = normalizeForCompare(a)
  const y = normalizeForCompare(b)
  if (x === y) return x.length > 0 ? 1 : 0
  const longest = Math.max(x.length, y.length)
  if (!longest || Math.min(x.length, y.length) / longest < 0.6) return 0
  return 1 - levenshtein(x, y) / longest
}
