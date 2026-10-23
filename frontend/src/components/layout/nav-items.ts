import {
  CalendarDays,
  ChartColumn,
  CircleHelp,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

/**
 * Navigasi utama sidebar (atas). Menu yang halamannya belum dibuat otomatis dapat route ComingSoonPage
 * (router.tsx membandingkan config ini dengan route yang sudah ada).
 */
export const MAIN_NAV: readonly NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Dompet', to: '/dompet', icon: Wallet },
  { label: 'Statistik', to: '/statistik', icon: ChartColumn },
  { label: 'Laporan', to: '/laporan', icon: FileText },
  { label: 'Pelanggan', to: '/pelanggan', icon: Users },
  { label: 'Kalender', to: '/kalender', icon: CalendarDays },
]

/** Navigasi sekunder sidebar (bawah). */
export const SECONDARY_NAV: readonly NavItem[] = [
  { label: 'Pengaturan', to: '/pengaturan', icon: Settings },
  { label: 'Bantuan', to: '/bantuan', icon: CircleHelp },
]

/** Semua menu (utama + sekunder) — sumber route "segera hadir" & label halaman. */
export const ALL_NAV: readonly NavItem[] = [...MAIN_NAV, ...SECONDARY_NAV]

/** Item menu untuk path persis (tanpa trailing slash), mis. "/dompet" → Dompet. */
export function findNavItem(pathname: string): NavItem | undefined {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return ALL_NAV.find((item) => item.to === path)
}
