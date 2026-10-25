/** "25/10/26" / "25-10-2026" → "2026-10-25". Tidak valid → "". */
export function parseReceiptDate(text: string): string {
  const parts = text.split(/[/-]/).map(Number)
  const [day, month, rawYear] = parts
  if (parts.length !== 3 || !day || !month || rawYear === undefined || Number.isNaN(rawYear)) return ''
  const year = rawYear < 100 ? 2000 + rawYear : rawYear
  if (month < 1 || month > 12 || day < 1 || day > 31) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${year}-${pad(month)}-${pad(day)}`
}
