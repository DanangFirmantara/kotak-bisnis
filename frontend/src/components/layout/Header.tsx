import { Bell, MessagesSquare } from 'lucide-react'
import { AccountMenu } from '@/components/common/AccountMenu'
import { IconButton } from '@/components/common/IconButton'
import { Skeleton } from '@/components/common/Skeleton'
import { useInbox, useOwnerProfile } from '@/hooks/useDashboard'
import { getFirstName } from '@/lib/format'
import { SearchBar } from './SearchBar'

/**
 * Header layout: sapaan pemilik · search pill · pesan & notifikasi.
 * HP (< sm, grid): baris 1 sapaan + 2 tombol + avatar menu akun (< md), baris 2 search selebar penuh. ≥ sm: flex seperti desktop
 * (pembungkus search+tombol `contents` di HP supaya anaknya ikut grid tanpa mengubah DOM desktop).
 */
export function Header() {
  const profile = useOwnerProfile()
  const inbox = useInbox()
  const unreadMessages = inbox.data?.unreadMessages ?? 0
  const unreadNotifications = inbox.data?.unreadNotifications ?? 0

  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-4 sm:flex sm:flex-wrap sm:justify-between sm:gap-4">
      <div className="min-w-0">
        {profile.data || profile.isError ? (
          <h1 className="truncate text-xl font-bold text-ink sm:text-2xl">
            {profile.data ? `Halo, ${getFirstName(profile.data.name)}!` : 'Halo!'}
          </h1>
        ) : (
          <>
            <span className="sr-only">Memuat profil…</span>
            <Skeleton className="h-7 w-48 sm:h-8" />
          </>
        )}
        <p className="mt-1 text-sm text-ink-muted">Pantau pemasukan, pengeluaran, dan aktivitas usahamu.</p>
      </div>

      <div className="contents sm:flex sm:w-auto sm:items-center sm:gap-3">
        <SearchBar className="col-span-2 row-start-2 min-w-0 sm:w-80 sm:flex-none" />
        <div className="col-start-2 row-start-1 flex items-center gap-2 sm:gap-3">
          <IconButton
            icon={MessagesSquare}
            label={unreadMessages > 0 ? `Pesan (${unreadMessages} belum dibaca)` : 'Pesan'}
            size="lg"
            showBadge={unreadMessages > 0}
          />
          <IconButton
            icon={Bell}
            label={unreadNotifications > 0 ? `Notifikasi (${unreadNotifications} baru)` : 'Notifikasi'}
            size="lg"
            showBadge={unreadNotifications > 0}
          />
          {/* Menu akun hanya < md: di ≥ md Pengaturan/Bantuan/Keluar sudah ada di Sidebar */}
          <AccountMenu className="md:hidden" />
        </div>
      </div>
    </header>
  )
}
