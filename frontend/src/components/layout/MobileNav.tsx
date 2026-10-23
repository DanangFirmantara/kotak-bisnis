import { cn } from '@/lib/utils'
import { MAIN_NAV } from './nav-items'
import { NavIconLink } from './NavIconLink'

/**
 * Bottom nav kaca untuk layar < md (sidebar disembunyikan); posisi fixed diatur AppLayout. Config sama dengan Sidebar (`MAIN_NAV`).
 * Menu sekunder (Pengaturan, Bantuan) tetap hanya di sidebar desktop.
 */
export function MobileNav({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Navigasi utama"
      className={cn(
        'flex items-center justify-around rounded-full border border-glass-border bg-glass-strong px-2 py-2 shadow-glass-lg backdrop-blur-xl',
        className,
      )}
    >
      {MAIN_NAV.map((item) => (
        <NavIconLink key={item.to} item={item} tooltipSide="top" />
      ))}
    </nav>
  )
}
