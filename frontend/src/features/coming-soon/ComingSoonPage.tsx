import { useLocation } from 'react-router'
import { Compass } from 'lucide-react'
import { DashboardLinkButton } from '@/components/common/DashboardLinkButton'
import { StatusView } from '@/components/common/StatusView'
import { findNavItem } from '@/components/layout/nav-items'
import { APP_NAME } from '@/lib/app-meta'

/** Menu sidebar yang halamannya belum dibuat (route di-generate dari `ALL_NAV` di router.tsx). */
export function ComingSoonPage() {
  const { pathname } = useLocation()
  const item = findNavItem(pathname)

  return (
    <StatusView
      icon={item?.icon ?? Compass}
      title={item ? `${item.label} segera hadir` : 'Halaman segera hadir'}
      description={`Menu ini sedang kami siapkan dan belum tersedia di versi pratinjau ${APP_NAME}.`}
      actions={<DashboardLinkButton />}
    />
  )
}
