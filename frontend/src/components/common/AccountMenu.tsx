import { LogOut } from 'lucide-react'
import { Link } from 'react-router'
import { Avatar } from '@/components/common/Avatar'
import { Skeleton } from '@/components/common/Skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SECONDARY_NAV } from '@/components/layout/nav-items'
import { useOwnerProfile } from '@/hooks/useDashboard'
import { useLogout } from '@/hooks/useLogout'
import { HIT_AREA } from '@/lib/responsive'
import { cn } from '@/lib/utils'

const ITEM = 'min-h-10 gap-3 rounded-xl px-3 text-sm text-ink'

/**
 * Menu akun (avatar → dropdown kaca): nama + email, menu sekunder (`SECONDARY_NAV`), Keluar.
 * Untuk HP, karena sidebar (tempat menu ini di desktop) disembunyikan di bawah md.
 */
export function AccountMenu({ className }: { className?: string }) {
  const profile = useOwnerProfile()
  const logout = useLogout()

  if (!profile.data) return <Skeleton className={cn('size-10 rounded-full', className)} />

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menu akun"
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          HIT_AREA,
          className,
        )}
      >
        <Avatar name={profile.data.name} size="sm" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="w-64 rounded-2xl border border-glass-border bg-glass-strong p-2 shadow-glass-lg backdrop-blur-xl"
      >
        <DropdownMenuLabel className="px-3 py-2">
          <p className="truncate text-sm font-semibold text-ink">{profile.data.name}</p>
          <p className="truncate text-xs font-normal text-ink-muted">{profile.data.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SECONDARY_NAV.map(({ label, to, icon: Icon }) => (
          <DropdownMenuItem key={to} asChild className={ITEM}>
            <Link to={to}>
              <Icon aria-hidden className="size-4 text-ink-muted" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout} className={cn(ITEM, 'text-danger-deep focus:bg-danger-soft focus:text-danger-deep')}>
          <LogOut aria-hidden className="size-4 text-danger-deep" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
