// Agregasi "top N + Lainnya" untuk chart peringkat (mis. belanja terbesar). Fungsi murni.

export interface RankInput {
  label: string
  value: number
}

export interface RankedRow {
  /** Unik per baris (nama yang sama boleh muncul dua kali) */
  key: string
  label: string
  value: number
  /** Porsi terhadap total semua baris (0..1) */
  share: number
  /** Baris agregat "Lainnya" */
  isOthers: boolean
}

export interface TopNOptions {
  limit?: number
  othersLabel?: (count: number) => string
}

/**
 * Urut nilai terbesar → terkecil, ambil `limit` teratas, sisanya digabung jadi satu baris "Lainnya (N item)".
 * Nilai ≤ 0 / bukan angka dibuang. Sisa tepat 1 baris ditampilkan apa adanya (bukan "Lainnya (1 item)").
 */
export function topNWithOthers(rows: readonly RankInput[], options: TopNOptions = {}): RankedRow[] {
  const { limit = 8, othersLabel = (count) => `Lainnya (${count} item)` } = options
  const valid = rows
    .map((row, index) => ({ ...row, index }))
    .filter((row) => Number.isFinite(row.value) && row.value > 0)
    .sort((a, b) => b.value - a.value || a.index - b.index)
  const grandTotal = valid.reduce((sum, row) => sum + row.value, 0)
  if (grandTotal === 0) return []

  const toRow = (row: { label: string; value: number }, key: string, isOthers = false): RankedRow => ({
    key,
    label: row.label,
    value: row.value,
    share: row.value / grandTotal,
    isOthers,
  })

  const keepAll = valid.length <= limit + 1
  const head = (keepAll ? valid : valid.slice(0, limit)).map((row) => toRow(row, `row-${row.index}`))
  if (keepAll) return head

  const rest = valid.slice(limit)
  const restTotal = rest.reduce((sum, row) => sum + row.value, 0)
  return [...head, toRow({ label: othersLabel(rest.length), value: restTotal }, 'others', true)]
}
