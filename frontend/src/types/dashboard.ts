// Tipe data dashboard (lihat tabel "Pemetaan kartu" di docs/planning/dashboard-ui.md).
// Nanti di-mirror persis ke DTO backend (camelCase, nullable → `| null`, tanggal = string ISO).

/** Cara angka ditampilkan — dipetakan ke helper di src/lib/format.ts */
export type ValueKind = 'currency' | 'number' | 'percent'

/** Satu titik deret waktu ringkas (sparkline, mini bar). */
export interface TrendPoint {
  label: string
  value: number
}

// ---------- Baris statistik ----------

export type StatId = 'spending' | 'newCustomers' | 'earningsToday' | 'activity'

/** Pengeluaran bulan ini · Pelanggan baru · Pendapatan hari ini · Aktivitas */
export interface StatSummary {
  id: StatId
  label: string
  value: number
  valueKind: ValueKind
  /** % vs periode sebelumnya; null kalau tidak relevan */
  changePercent: number | null
  /** Deret kecil untuk sparkline / mini bar; null kalau kartu tanpa chart */
  trend: TrendPoint[] | null
  /** Badge "Live" (kartu Aktivitas) */
  isLive: boolean
  /** Teks kecil di bawah nilai, mis. "Laba bersih hari ini"; null kalau tidak ada */
  caption: string | null
}

// ---------- Saldo ----------

export type BalancePeriod = 'weekly' | 'monthly' | 'yearly'

export interface BalancePoint {
  label: string
  balance: number
}

export interface BalanceOverview {
  period: BalancePeriod
  currentBalance: number
  /** Rasio pemasukan vs pengeluaran periode ini (%) */
  ratioPercent: number
  /** Perubahan rasio vs periode sebelumnya (poin %) */
  ratioChangePercent: number
  /** Perubahan saldo vs periode sebelumnya (%) */
  balanceChangePercent: number
  /** Saldo sesuai target periode ini */
  onTrack: boolean
  points: BalancePoint[]
}

// ---------- Pendapatan ----------

export interface EarningsSummary {
  total: number
  /** % pendapatan vs bulan lalu */
  changePercent: number
  /** % laba vs bulan lalu (teks "Laba x% lebih tinggi …") */
  profitChangePercent: number
  target: number
  /** Capaian target (0–100) untuk gauge */
  targetPercent: number
}

// ---------- Profil pemilik usaha ----------

export interface ProfileStat {
  label: string
  value: number
  valueKind: ValueKind
}

export interface OwnerProfile {
  name: string
  email: string
  /** Identitas usaha sudah diverifikasi (badge di avatar) */
  isVerified: boolean
  businessName: string
  role: string
  stats: ProfileStat[]
}

// ---------- Kartu bisnis ----------

export interface BusinessCard {
  id: string
  holderName: string
  /** Sudah di-mask dari backend, mis. "•••• 4821" */
  maskedNumber: string
  /** "MM/YY" */
  expiry: string
  balance: number
  network: string
}

// ---------- Transfer terakhir ----------

export type TransferDirection = 'in' | 'out'

export interface Transfer {
  id: string
  counterparty: string
  description: string
  /** LocalDateTime ISO, mis. "2026-10-22T14:05:00" */
  occurredAt: string
  /** Selalu positif; arah ditentukan `direction` */
  amount: number
  direction: TransferDirection
}

// ---------- Keamanan akun ----------

export type SecurityLevel = 'safe' | 'warning' | 'risk'

export interface SecurityStatus {
  level: SecurityLevel
  title: string
  message: string
  actionLabel: string
}

// ---------- Kotak masuk (badge header) ----------

export interface InboxSummary {
  unreadMessages: number
  unreadNotifications: number
}

// ---------- Agregat satu halaman ----------

export interface DashboardData {
  stats: StatSummary[]
  earnings: EarningsSummary
  profile: OwnerProfile
  /** Kartu bisnis di dompet; [0] = kartu utama (paling depan) */
  cards: BusinessCard[]
  transfers: Transfer[]
  security: SecurityStatus
  inbox: InboxSummary
}
