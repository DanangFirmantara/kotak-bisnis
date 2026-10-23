import {
  Activity,
  ArrowLeftRight,
  ChartLine,
  Database,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCog,
  type LucideIcon,
} from 'lucide-react'
import type { GlassAccordionItem } from '@/components/common/GlassAccordion'
import { APP_VERSION } from '@/lib/app-meta'

/** Konten statis halaman Bantuan (bukan data API → tanpa service/mock/loading). */
export interface FaqCategory {
  id: string
  title: string
  items: readonly GlassAccordionItem[]
}

export const FAQ_CATEGORIES: readonly FaqCategory[] = [
  {
    id: 'tentang',
    title: 'Tentang Kotak Bisnis',
    items: [
      {
        id: 'apa-itu',
        icon: Sparkles,
        question: 'Apa itu Kotak Bisnis?',
        answer:
          'Kotak Bisnis adalah dashboard bisnis sederhana untuk memantau kondisi usahamu dalam satu layar — pendapatan, pengeluaran, saldo, pelanggan, hingga transfer terbaru.',
      },
      {
        id: 'fungsi',
        icon: LayoutDashboard,
        question: 'Apa saja fungsi kartu di dashboard?',
        answer:
          'Baris atas merangkum angka kunci (pendapatan, pengeluaran, pelanggan, dan lainnya). Di bawahnya ada kartu Saldo, Pendapatan, Profil, Kartu Bisnis, Transfer, dan Keamanan — masing-masing fokus pada satu sisi usahamu.',
      },
      {
        id: 'data-contoh',
        icon: Database,
        question: 'Apakah data yang tampil sudah data asli?',
        answer:
          'Belum. Saat ini Kotak Bisnis masih versi pratinjau dengan data contoh (dummy). Nanti data akan tersambung langsung ke sistem backend tanpa mengubah tampilan.',
      },
    ],
  },
  {
    id: 'membaca-dashboard',
    title: 'Membaca Dashboard',
    items: [
      {
        id: 'grafik-saldo',
        icon: ChartLine,
        question: 'Bagaimana cara membaca grafik Saldo?',
        answer:
          'Garis menunjukkan pergerakan saldo dari waktu ke waktu. Arahkan kursor (atau ketuk) titik pada grafik untuk melihat nilainya, lalu ganti periode lewat filter di pojok kanan atas kartu.',
      },
      {
        id: 'aktivitas-live',
        icon: Activity,
        question: 'Apa arti label Aktivitas atau Live?',
        answer:
          'Label Live menandai angka yang diperbarui secara berkala, seperti aktivitas transaksi terbaru. Angka lain adalah ringkasan untuk periode yang dipilih.',
      },
    ],
  },
  {
    id: 'akun',
    title: 'Akun & Keamanan',
    items: [
      {
        id: 'akses',
        icon: UserCog,
        question: 'Siapa saja yang bisa mengakses aplikasi?',
        answer:
          'Ada dua peran: Admin yang bisa mengelola data dan pengguna, serta User yang dapat melihat dan memakai fitur sesuai izinnya.',
      },
      {
        id: 'keamanan',
        icon: ShieldCheck,
        question: 'Bagaimana keamanan akun saya dijaga?',
        answer:
          'Sesi login memakai token yang otomatis kedaluwarsa, dan kata sandi tidak pernah disimpan dalam bentuk asli. Kartu Keamanan di dashboard juga mengingatkan bila ada pengaturan yang perlu diperbarui.',
      },
      {
        id: 'lupa-sandi',
        icon: KeyRound,
        question: 'Saya lupa kata sandi, harus bagaimana?',
        answer: 'Hubungi Admin usahamu untuk mengatur ulang kata sandi, atau kirim pesan ke tim bantuan kami.',
      },
      {
        id: 'hubungi',
        icon: LifeBuoy,
        question: 'Bagaimana cara menghubungi tim bantuan?',
        answer:
          'Klik tombol "Hubungi kami" di halaman ini untuk mengirim email. Kami biasanya membalas dalam 1 hari kerja.',
      },
    ],
  },
]

export interface AppCapability {
  id: string
  icon: LucideIcon
  label: string
}

/** Info ringkas aplikasi di kartu samping. */
export const APP_INFO = {
  version: `Pratinjau ${APP_VERSION}`,
  dataSource: 'Contoh (dummy)',
  language: 'Indonesia',
  lastUpdated: 'Okt 2026',
  contactEmail: 'bantuan@kotakbisnis.example', // placeholder — ganti saat kanal bantuan resmi ada
  responseTime: '1 hari kerja',
  footnote: 'Versi pratinjau · Dibuat dengan data contoh',
  capabilities: [
    { id: 'pendapatan', icon: TrendingUp, label: 'Pantau pendapatan & pengeluaran' },
    { id: 'saldo', icon: ChartLine, label: 'Baca grafik pergerakan saldo' },
    { id: 'transfer', icon: ArrowLeftRight, label: 'Cek transfer terbaru' },
    { id: 'keamanan', icon: ShieldCheck, label: 'Atur keamanan akun' },
  ] satisfies readonly AppCapability[],
} as const
