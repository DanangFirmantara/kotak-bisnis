// Satu-satunya tempat format angka di UI (Intl id-ID). Jangan format inline di komponen.
import type { ValueKind } from '@/types/dashboard'

const LOCALE = 'id-ID'

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })

const compactFormatter = new Intl.NumberFormat(LOCALE, {
  notation: 'compact',
  maximumFractionDigits: 1,
})

/** 12500000 → "Rp 12.500.000" */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

/** 1250 → "1.250" */
export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** 12500000 → "12,5 jt"; withCurrency → "Rp 12,5 jt" */
export function formatCompact(value: number, options: { withCurrency?: boolean } = {}): string {
  const text = compactFormatter.format(value)
  return options.withCurrency ? `Rp ${text}` : text
}

/**
 * Nilai persen dalam satuan persen (12.4 → "12,4%").
 * `signed` menambah tanda + untuk nilai positif ("+12,4%").
 */
export function formatPercent(
  value: number,
  options: { signed?: boolean; fractionDigits?: number } = {},
): string {
  const { signed = false, fractionDigits = 1 } = options
  const text = new Intl.NumberFormat(LOCALE, {
    maximumFractionDigits: fractionDigits,
    signDisplay: signed ? 'exceptZero' : 'auto',
  }).format(value)
  return `${text}%`
}

/** "Rina Wulandari" → "RW", "budi" → "B" */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase() || '?'
}

/** Format sesuai `ValueKind` dari data (currency → Rupiah, percent → "12,4%", number → "1.250"). */
export function formatByKind(value: number, kind: ValueKind): string {
  if (kind === 'currency') return formatCurrency(value)
  if (kind === 'percent') return formatPercent(value)
  return formatNumber(value)
}

/** "Rina Wulandari" → "Rina" */
export function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? ''
}

/** 2450000 → "+Rp 2.450.000", -7800000 → "−Rp 7.800.000" (tanda minus tipografis) */
export function formatSignedCurrency(value: number): string {
  if (value === 0) return formatCurrency(0)
  return `${value > 0 ? '+' : '−'}${formatCurrency(Math.abs(value))}`
}

const timeFormatter = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' })
const dayMonthFormatter = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' })

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
const DAY_MS = 86_400_000

/**
 * ISO LocalDateTime → "Hari ini, 10.15" / "Kemarin, 16.40" / "20 Okt, 09.05".
 * `now` bisa diisi untuk tes; default waktu sekarang.
 */
export function formatDayTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '-'
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS)
  const day = diffDays === 0 ? 'Hari ini' : diffDays === 1 ? 'Kemarin' : dayMonthFormatter.format(date)
  return `${day}, ${timeFormatter.format(date)}`
}

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'medium' })

/** ISO → "23 Okt 2026, 10.15.30" (tanggal + jam lengkap, mis. waktu build / cek health). */
export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '-' : dateTimeFormatter.format(date)
}
