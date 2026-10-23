// Data dummy dashboard. HANYA diimpor oleh src/services/ — jangan import langsung di komponen.
import type { BalanceOverview, BalancePeriod, DashboardData } from '@/types/dashboard'

const toTrend = (labels: string[], values: number[]) =>
  labels.map((label, i) => ({ label, value: values[i] ?? 0 }))

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const WEEKS = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8']

export const dashboardMock: DashboardData = {
  stats: [
    {
      id: 'spending',
      label: 'Pengeluaran bulan ini',
      value: 18_750_000,
      valueKind: 'currency',
      changePercent: -4.2,
      trend: toTrend(DAYS, [2.1, 3.4, 2.6, 4.2, 3.1, 1.6, 2.4].map((v) => v * 1_000_000)),
      isLive: false,
      caption: null,
    },
    {
      id: 'newCustomers',
      label: 'Pelanggan baru',
      value: 128,
      valueKind: 'number',
      changePercent: 12.5,
      trend: toTrend(WEEKS, [62, 70, 68, 84, 79, 95, 110, 128]),
      isLive: false,
      caption: null,
    },
    {
      id: 'earningsToday',
      label: 'Pendapatan hari ini',
      value: 4_325_000,
      valueKind: 'currency',
      changePercent: 6.8,
      trend: null,
      isLive: false,
      caption: null,
    },
    {
      id: 'activity',
      label: 'Aktivitas',
      value: 2_960_000,
      valueKind: 'currency',
      changePercent: 3.1,
      trend: toTrend(
        ['09', '10', '11', '12', '13', '14', '15', '16'],
        [180, 240, 210, 320, 290, 410, 380, 450].map((v) => v * 1_000),
      ),
      isLive: true,
      caption: 'Arus kas masuk hari ini',
    },
  ],
  earnings: {
    total: 86_400_000,
    changePercent: 9.4,
    profitChangePercent: 12,
    target: 120_000_000,
    targetPercent: 72,
  },
  profile: {
    name: 'Rina Wulandari',
    email: 'rina@sekararum.id',
    isVerified: true,
    businessName: 'Toko Kain Sekar Arum',
    role: 'Pemilik usaha',
    stats: [
      { label: 'Transaksi', value: 1_284, valueKind: 'number' },
      { label: 'Pelanggan', value: 642, valueKind: 'number' },
      { label: 'Kepuasan', value: 96, valueKind: 'percent' },
    ],
  },
  cards: [
    {
      id: 'card-01',
      holderName: 'Rina Wulandari',
      maskedNumber: '•••• •••• •••• 4821',
      expiry: '09/29',
      balance: 52_870_000,
      network: 'Kotak Bisnis',
    },
    {
      id: 'card-02',
      holderName: 'Rina Wulandari',
      maskedNumber: '•••• •••• •••• 1307',
      expiry: '03/28',
      balance: 12_400_000,
      network: 'Kotak Bisnis',
    },
    {
      id: 'card-03',
      holderName: 'Toko Kain Sekar Arum',
      maskedNumber: '•••• •••• •••• 9954',
      expiry: '11/27',
      balance: 4_150_000,
      network: 'Kotak Bisnis',
    },
  ],
  transfers: [
    {
      id: 'trf-001',
      counterparty: 'Budi Santoso',
      description: 'Pembayaran pesanan #INV-2041',
      occurredAt: '2026-10-23T10:15:00',
      amount: 2_450_000,
      direction: 'in',
    },
    {
      id: 'trf-002',
      counterparty: 'CV Benang Nusantara',
      description: 'Pembelian bahan baku',
      occurredAt: '2026-10-22T16:40:00',
      amount: 7_800_000,
      direction: 'out',
    },
    {
      id: 'trf-003',
      counterparty: 'Siti Rahmawati',
      description: 'Pembayaran pesanan #INV-2038',
      occurredAt: '2026-10-22T09:05:00',
      amount: 1_175_000,
      direction: 'in',
    },
  ],
  security: {
    level: 'safe',
    title: 'Akun kamu aman',
    message: 'Verifikasi dua langkah aktif. Terakhir dicek hari ini pukul 08.00.',
    actionLabel: 'Perbarui keamanan',
  },
  inbox: {
    unreadMessages: 3,
    unreadNotifications: 0,
  },
}

export const balanceMock: Record<BalancePeriod, BalanceOverview> = {
  weekly: {
    period: 'weekly',
    currentBalance: 52_870_000,
    ratioPercent: 64,
    ratioChangePercent: 2.4,
    balanceChangePercent: 4.5,
    onTrack: true,
    points: [48.2, 49.1, 47.6, 50.4, 51.2, 50.6, 52.87].map((v, i) => ({
      label: DAYS[i] ?? '',
      balance: v * 1_000_000,
    })),
  },
  monthly: {
    period: 'monthly',
    currentBalance: 52_870_000,
    ratioPercent: 58,
    ratioChangePercent: -1.8,
    balanceChangePercent: 6.6,
    onTrack: true,
    points: [31.5, 34.2, 33.1, 38.6, 41.2, 39.8, 44.5, 46.1, 43.9, 52.87].map((v, i) => ({
      label: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'][i] ?? '',
      balance: v * 1_000_000,
    })),
  },
  yearly: {
    period: 'yearly',
    currentBalance: 52_870_000,
    ratioPercent: 61,
    ratioChangePercent: 3.2,
    balanceChangePercent: 28.3,
    onTrack: false,
    points: [12.4, 21.8, 30.5, 41.2, 52.87].map((v, i) => ({
      label: String(2022 + i),
      balance: v * 1_000_000,
    })),
  },
}
