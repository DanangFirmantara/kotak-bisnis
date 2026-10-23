import { LogOut } from 'lucide-react'
import { AppLogo } from '@/components/common/AppLogo'
import { Avatar } from '@/components/common/Avatar'
import { IconButton } from '@/components/common/IconButton'
import { Skeleton } from '@/components/common/Skeleton'
import { useOwnerProfile } from '@/hooks/useDashboard'
import { useLogout } from '@/hooks/useLogout'
import { cn } from '@/lib/utils'
import { MAIN_NAV, SECONDARY_NAV } from './nav-items'
import { NavIconLink } from './NavIconLink'

/** Satu ritme jarak untuk seluruh sidebar: antar-ikon 16px, antar-blok 32px. */
const NAV_STACK = 'flex flex-col items-center gap-4'
const BLOCK_GAP = 'mt-8'

/** Kolom ikon kaca di kiri: logo · nav utama · nav sekunder + keluar · avatar pemilik. */
export function Sidebar({ className }: { className?: string }) {
  const profile = useOwnerProfile()
  const logout = useLogout()

  return (
    <aside
      className={cn(
        'flex h-full w-[72px] flex-col items-center rounded-[2rem] border border-glass-border bg-glass py-4 shadow-glass backdrop-blur-xl',
        className,
      )}
    >
      <AppLogo />

      {/* Pengaman layar pendek: scroll tanpa scrollbar. py-2 memberi ruang ring fokus & shadow ikon aktif
          (overflow memotongnya); mt-6 + pt-2 dan pb-2 − mb-2 menjaga jarak efektif tetap = BLOCK_GAP (32px). */}
      <nav
        aria-label="Navigasi utama"
        className={cn(
          NAV_STACK,
          'mt-6 -mb-2 min-h-0 w-full flex-1 overflow-y-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
      >
        {MAIN_NAV.map((item) => (
          <NavIconLink key={item.to} item={item} tooltipSide="right" />
        ))}
      </nav>

      <div className={cn(NAV_STACK, BLOCK_GAP)}>
        {SECONDARY_NAV.map((item) => (
          <NavIconLink key={item.to} item={item} tooltipSide="right" />
        ))}
        <IconButton
          icon={LogOut}
          label="Keluar"
          variant="ghost"
          tooltipSide="right"
          onClick={logout}
        />
      </div>

      <div className={BLOCK_GAP}>
        {profile.data ? (
          <Avatar name={profile.data.name} size="sm" />
        ) : (
          <Skeleton className="size-8 rounded-full" />
        )}
      </div>
    </aside>
  )
}
