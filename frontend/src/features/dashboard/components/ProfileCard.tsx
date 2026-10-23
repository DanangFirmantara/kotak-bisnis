import type { OwnerProfile } from '@/types/dashboard'
import { useOwnerProfile } from '@/hooks/useDashboard'
import { formatByKind } from '@/lib/format'
import { TEXT_MICRO } from '@/lib/responsive'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/GlassCard'
import { Avatar } from '@/components/common/Avatar'
import { Skeleton } from '@/components/common/Skeleton'
import { QueryState } from '@/components/dashboard/QueryState'

const BODY = 'flex h-full flex-col items-center gap-4 text-center'

/** Kartu profil pemilik usaha: avatar terverifikasi · nama · email · 3 statistik. */
export function ProfileCard() {
  const query = useOwnerProfile()

  return (
    <GlassCard className="h-full">
      <QueryState
        query={query}
        loadingLabel="Memuat profil…"
        loadingClassName={BODY}
        loading={
          <>
            <Skeleton className="size-20 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="mt-auto h-10 w-full rounded-2xl" />
          </>
        }
        error={{ title: 'Gagal memuat profil' }}
        stateClassName="min-h-40"
      >
        {(profile) => <ProfileBody profile={profile} />}
      </QueryState>
    </GlassCard>
  )
}

function ProfileBody({ profile }: { profile: OwnerProfile }) {
  return (
    <div className={BODY}>
      <Avatar name={profile.name} size="lg" verified={profile.isVerified} className="mt-1" />
      <div className="max-w-full min-w-0">
        <p className="truncate text-base font-bold text-ink">{profile.name}</p>
        <p className="truncate text-xs text-ink-muted" title={profile.email}>
          {profile.email}
        </p>
      </div>

      {profile.stats.length > 0 && (
        <dl className="mt-auto grid w-full grid-cols-3 divide-x divide-glass-line">
          {profile.stats.map((stat) => (
            <div key={stat.label} className="flex min-w-0 flex-col-reverse gap-0.5 px-1">
              <dt className={cn('truncate text-ink-muted', TEXT_MICRO)}>{stat.label}</dt>
              <dd className="truncate text-lg font-bold text-ink tabular-nums">
                {formatByKind(stat.value, stat.valueKind)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
