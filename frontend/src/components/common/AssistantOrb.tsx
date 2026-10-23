import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface AssistantOrbProps {
  /** Teks bubble kecil di kiri atas orb */
  message?: string
  className?: string
}

const FLOAT = { y: [0, -8, 0] }
const FLOAT_TRANSITION = { duration: 4.5, ease: 'easeInOut', repeat: Infinity } as const
const GLOW = { opacity: [0.55, 0.9, 0.55], scale: [1, 1.12, 1] }
const GLOW_TRANSITION = { duration: 3.2, ease: 'easeInOut', repeat: Infinity } as const

/**
 * Orb kaca bercahaya "Sage" — HANYA dekorasi (fitur AI di luar scope): aria-hidden, tidak menangkap pointer.
 * Melayang + glow berdenyut halus; diam total saat reduced motion.
 */
export function AssistantOrb({ message, className }: AssistantOrbProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div aria-hidden className={cn('pointer-events-none relative size-24 select-none', className)}>
      {message && (
        <span className="absolute right-[70%] bottom-[88%] w-max max-w-52 rounded-2xl rounded-br-sm border border-glass-border bg-glass-strong px-3 py-1.5 text-[11px] font-medium text-ink shadow-glass backdrop-blur-xl">
          {message}
        </span>
      )}

      <motion.div
        className="absolute inset-0"
        animate={reduceMotion ? undefined : FLOAT}
        transition={FLOAT_TRANSITION}
      >
        {/* Glow luar */}
        <motion.span
          className="absolute -inset-4 rounded-full bg-orb-glow blur-2xl"
          animate={reduceMotion ? undefined : GLOW}
          transition={GLOW_TRANSITION}
        />
        {/* Cincin kaca */}
        <span className="absolute -inset-2 rounded-full border border-white/60 bg-white/25 backdrop-blur-md" />
        {/* Bola */}
        <span className="absolute inset-0 overflow-hidden rounded-full bg-radial-[at_30%_25%] from-white via-orb-blue to-orb-violet shadow-glass-lg">
          <span className="absolute inset-x-3 top-1.5 h-1/3 rounded-full bg-linear-to-b from-white/80 to-transparent" />
        </span>
        {/* "Mata" senyum */}
        <span className="absolute inset-x-0 top-[44%] flex justify-center gap-3">
          {['left', 'right'].map((eye) => (
            <span key={eye} className="h-1.5 w-3 rounded-t-full border-x-2 border-t-2 border-white/95" />
          ))}
        </span>
      </motion.div>
    </div>
  )
}
