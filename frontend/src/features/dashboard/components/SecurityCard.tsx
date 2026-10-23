import { Fingerprint, ShieldAlert, ShieldX, type LucideIcon } from 'lucide-react'
import type { SecurityLevel } from '@/types/dashboard'
import { useSecurityStatus } from '@/hooks/useDashboard'
import { GlassCard } from '@/components/ui/GlassCard'
import { ActionButton } from '@/components/common/ActionButton'
import { IconCircle } from '@/components/common/IconCircle'
import { Skeleton } from '@/components/common/Skeleton'
import { QueryState } from '@/components/dashboard/QueryState'

const LEVEL_ICON: Record<SecurityLevel, LucideIcon> = {
  safe: Fingerprint,
  warning: ShieldAlert,
  risk: ShieldX,
}

const BODY = 'flex h-full flex-col items-center justify-center gap-3 text-center'

/** Kartu status keamanan akun + tombol aksi. */
export function SecurityCard() {
  const query = useSecurityStatus()

  return (
    <GlassCard className="h-full">
      <QueryState
        query={query}
        loadingLabel="Memuat status keamanan…"
        loadingClassName={BODY}
        loading={
          <>
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </>
        }
        error={{ title: 'Gagal memuat status keamanan' }}
        stateClassName="min-h-32"
      >
        {(security) => (
          <div className={BODY}>
            <IconCircle icon={LEVEL_ICON[security.level]} size="lg" />
            <div>
              <p className="text-base font-bold text-ink">{security.title}</p>
              <p className="mt-1 text-xs text-ink-muted">{security.message}</p>
            </div>
            <ActionButton className="mt-1">{security.actionLabel}</ActionButton>
          </div>
        )}
      </QueryState>
    </GlassCard>
  )
}
