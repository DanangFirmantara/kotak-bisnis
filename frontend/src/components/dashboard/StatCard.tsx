import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { IconCircle } from '@/components/common/IconCircle'
import { Skeleton } from '@/components/common/Skeleton'
import { GlassCard } from '@/components/ui/GlassCard'
import { TEXT_MICRO, TEXT_NANO } from '@/lib/responsive'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  label: string
  /** Nilai penuh, sudah diformat (lib/format.ts) — selalu jadi title/tooltip */
  value: string
  /**
   * Versi ringkas (mis. "Rp 18,8 jt"). Kalau diisi, dipakai otomatis saat kolom teks sempit
   * (container query) supaya nominal tidak terpotong.
   */
  compactValue?: string
  /** Ikon dalam lingkaran di kiri */
  icon?: LucideIcon
  /** Chart kecil di kanan (Sparkline / MiniBarChart) */
  visual?: ReactNode
  /** Teks kecil di bawah nilai */
  caption?: string | null
  /** Badge "Live" berdenyut di samping label */
  live?: boolean
  /** highlight = kartu sage gradient, teks putih */
  variant?: 'default' | 'highlight'
  className?: string
}

const LABEL_ROW = 'flex min-w-0 items-center gap-2'
const BODY_ROW = 'flex h-full items-center gap-3'

/** Kartu statistik ringkas baris atas dashboard: [ikon] label/nilai/caption [chart]. */
export function StatCard({ label, value, compactValue, icon, visual, caption, live = false, variant = 'default', className }: StatCardProps) {
  const onDark = variant === 'highlight'

  return (
    <GlassCard variant={variant} className={cn('h-full min-h-28', className)}>
      <div className={BODY_ROW}>
        {icon && <IconCircle icon={icon} variant={onDark ? 'onDark' : 'soft'} size="lg" />}

        <div className="@container min-w-0 flex-1">
          <div className={LABEL_ROW}>
            <p className={cn('truncate text-xs font-medium', onDark ? 'text-white/80' : 'text-ink-muted')}>{label}</p>
            {live && <LiveBadge />}
          </div>
          <p
            title={value}
            className={cn('mt-1 truncate text-xl font-bold tabular-nums 2xl:text-2xl', onDark ? 'text-white' : 'text-ink')}
          >
            {compactValue ? (
              <>
                <span className="@[12rem]:hidden">{compactValue}</span>
                <span className="hidden @[12rem]:inline">{value}</span>
              </>
            ) : (
              value
            )}
          </p>
          {caption && (
            <p className={cn('mt-0.5 truncate', TEXT_MICRO, onDark ? 'text-white/70' : 'text-ink-subtle')}>{caption}</p>
          )}
        </div>

        {visual && <div className="w-20 shrink-0 self-end">{visual}</div>}
      </div>
    </GlassCard>
  )
}

function LiveBadge() {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-1.5 py-0.5 font-semibold text-white',
        TEXT_NANO,
      )}
    >
      <span aria-hidden className="relative flex size-1.5">
        <span className="absolute inset-0 rounded-full bg-white opacity-75 motion-safe:animate-ping" />
        <span className="relative size-1.5 rounded-full bg-white" />
      </span>
      Live
    </span>
  )
}

/** Placeholder StatCard saat loading (bentuk sama → tidak ada lompatan layout). */
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <GlassCard className={cn('h-full min-h-28', className)} aria-busy="true">
      <span className="sr-only">Memuat statistik…</span>
      <div className={BODY_ROW}>
        <Skeleton className="size-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    </GlassCard>
  )
}
