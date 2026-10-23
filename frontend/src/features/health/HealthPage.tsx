import { Activity, Check, Copy, TriangleAlert } from 'lucide-react'
import { ActionButton } from '@/components/common/ActionButton'
import { DashboardLinkButton } from '@/components/common/DashboardLinkButton'
import { IconCircle } from '@/components/common/IconCircle'
import { QueryState } from '@/components/dashboard/QueryState'
import { FadeIn } from '@/components/motion/FadeIn'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { ENTRANCE_DELAY, MOTION } from '@/components/motion/variants'
import { GlassCard } from '@/components/ui/GlassCard'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { useHealth } from '@/hooks/useHealth'
import { APP_NAME } from '@/lib/app-meta'
import type { HealthInfo } from '@/types/health'
import { HealthBadge } from './components/HealthBadge'
import { HealthDetails, HealthDetailsSkeleton } from './components/HealthDetails'
import { toHealthSummary } from './health-status'

/** `/health` — publik (tanpa login), di StandaloneLayout. Cek versi yang ter-deploy & status layanan. */
export function HealthPage() {
  const query = useHealth()
  const status = query.isError ? 'DOWN' : query.data?.status

  return (
    <FadeIn delay={ENTRANCE_DELAY.content} className="w-full max-w-xl">
      <GlassCard className="p-5 sm:p-8">
        <Stagger delay={ENTRANCE_DELAY.content + MOTION.stagger} className="flex flex-col gap-6">
          <StaggerItem className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <IconCircle icon={Activity} size="lg" className="shadow-glass" />
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-ink">{APP_NAME}</h1>
                <p className="text-xs text-ink-muted">Status aplikasi</p>
              </div>
            </div>
            <HealthBadge status={status} />
          </StaggerItem>

          <StaggerItem>
            <QueryState
              query={query}
              loading={<HealthDetailsSkeleton />}
              loadingLabel="Memeriksa status aplikasi…"
              error={{ title: 'Status tidak bisa dimuat', description: 'Coba muat ulang sebentar lagi.' }}
            >
              {(info) => <HealthDetails info={info} />}
            </QueryState>
          </StaggerItem>

          <StaggerItem className="flex flex-wrap items-center gap-2 border-t border-glass-border pt-5">
            <CopyInfoButton info={query.data} />
            <DashboardLinkButton tone="glass" label="Ke Dashboard" />
          </StaggerItem>
        </Stagger>
      </GlassCard>
    </FadeIn>
  )
}

const COPY_FEEDBACK = {
  idle: { icon: Copy, label: 'Salin info' },
  copied: { icon: Check, label: 'Tersalin' },
  error: { icon: TriangleAlert, label: 'Gagal menyalin' },
} as const

function CopyInfoButton({ info }: { info?: HealthInfo }) {
  const { state, copy } = useCopyToClipboard()
  const { icon: Icon, label } = COPY_FEEDBACK[state]

  return (
    <ActionButton disabled={!info} onClick={() => info && void copy(toHealthSummary(info))}>
      <Icon aria-hidden />
      <span aria-live="polite">{label}</span>
    </ActionButton>
  )
}
