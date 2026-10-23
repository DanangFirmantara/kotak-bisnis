import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { FadeIn } from '@/components/motion/FadeIn'
import { Stagger, StaggerItem } from '@/components/motion/Stagger'
import { ENTRANCE_DELAY, MOTION } from '@/components/motion/variants'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'
import { IconCircle } from './IconCircle'

export type StatusTone = 'neutral' | 'warning' | 'danger'

/** Warna per tone: angka besar (gradient transparan) + lingkaran ikon. Semua dari token `index.css`. */
const TONE_CLASS: Record<StatusTone, { code: string; icon: string }> = {
  neutral: { code: 'from-sage-300/80 to-sage-100/10', icon: 'bg-sage-50 text-sage-dark' },
  warning: { code: 'from-warning/70 to-warning-soft/10', icon: 'bg-warning-soft text-warning-deep' },
  danger: { code: 'from-danger/70 to-danger-soft/10', icon: 'bg-danger-soft text-danger-deep' },
}

export interface StatusViewProps {
  icon: LucideIcon
  title: string
  description: ReactNode
  /** Kode besar di bawah ikon, mis. "404" / "403" (tampil utuh, tidak ditimpa ikon). Tanpa kode = ikon saja. */
  code?: string
  tone?: StatusTone
  /** Info tambahan di bawah deskripsi, mis. chip path yang diakses */
  detail?: ReactNode
  /** Tombol aksi (ActionButton) — dibungkus baris flex-wrap terpusat */
  actions?: ReactNode
  className?: string
}

/**
 * Tampilan status satu halaman penuh (404, 403, "segera hadir"): kartu kaca terpusat,
 * susunan vertikal ikon → kode besar gradient → judul → deskripsi → detail → aksi.
 * Masuk bertahap (FadeIn → Stagger isi kartu; ikon dan kode jadi item terpisah).
 */
export function StatusView({
  icon,
  title,
  description,
  code,
  tone = 'neutral',
  detail,
  actions,
  className,
}: StatusViewProps) {
  const toneClass = TONE_CLASS[tone]

  return (
    <FadeIn delay={ENTRANCE_DELAY.content} className={cn('mx-auto w-full max-w-lg', className)}>
      <GlassCard className="px-5 py-8 text-center sm:px-10 sm:py-10">
        <Stagger delay={ENTRANCE_DELAY.content + MOTION.stagger} className="flex flex-col items-center gap-3">
          <StaggerItem>
            <IconCircle icon={icon} size="lg" className={cn('shadow-glass', toneClass.icon)} />
          </StaggerItem>

          {code && (
            <StaggerItem>
              <span
                aria-hidden
                className={cn(
                  'block bg-linear-to-b bg-clip-text text-[5.5rem] leading-none font-extrabold tracking-tighter text-transparent select-none sm:text-[7rem]',
                  toneClass.code,
                )}
              >
                {code}
              </span>
            </StaggerItem>
          )}

          <StaggerItem>
            {code && <p className="sr-only">Kode {code}</p>}
            <h1 className="text-xl font-bold text-ink">{title}</h1>
          </StaggerItem>

          <StaggerItem className="max-w-sm text-sm text-ink-muted">{description}</StaggerItem>

          {detail && <StaggerItem className="max-w-full">{detail}</StaggerItem>}

          {actions && (
            // HP: tombol ditumpuk selebar kartu (rapi, target sentuh lebar) · ≥ sm: satu baris terpusat
            <StaggerItem className="mt-3 flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
              {actions}
            </StaggerItem>
          )}
        </Stagger>
      </GlassCard>
    </FadeIn>
  )
}
