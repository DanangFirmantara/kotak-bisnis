import { NavLink } from 'react-router'
import { Hint, type HintSide } from '@/components/common/Hint'
import { iconButtonVariants } from '@/components/common/icon-button-variants'
import { cn } from '@/lib/utils'
import type { NavItem } from './nav-items'

export interface NavIconLinkProps {
  item: NavItem
  /** Posisi tooltip label: kanan di sidebar, atas di bottom nav mobile */
  tooltipSide?: HintSide
}

/** Satu ikon navigasi (sidebar & bottom nav): lingkaran sage saat aktif, tooltip label. */
export function NavIconLink({ item, tooltipSide = 'right' }: NavIconLinkProps) {
  const Icon = item.icon

  return (
    <Hint label={item.label} side={tooltipSide}>
      <NavLink
        to={item.to}
        end={item.to === '/'}
        aria-label={item.label}
        className={({ isActive }) => cn(iconButtonVariants({ variant: isActive ? 'solid' : 'ghost', size: 'md' }))}
      >
        <Icon aria-hidden strokeWidth={1.8} />
      </NavLink>
    </Hint>
  )
}
