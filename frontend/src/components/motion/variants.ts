import type { Transition, Variants } from 'motion/react'

/** Timing animasi masuk — satu sumber untuk FadeIn & Stagger. */
export const MOTION = {
  offsetY: 12,
  duration: 0.45,
  stagger: 0.07,
  ease: [0.22, 1, 0.36, 1] as const,
}

/** Urutan masuk halaman (detik): sidebar → header → kartu konten (lalu stagger per kartu) → footer. */
export const ENTRANCE_DELAY = {
  sidebar: 0,
  header: 0.06,
  content: 0.16,
  footer: 0.4,
} as const

export const fadeUpTransition: Transition = { duration: MOTION.duration, ease: MOTION.ease }

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: MOTION.offsetY },
  visible: { opacity: 1, y: 0, transition: fadeUpTransition },
}
