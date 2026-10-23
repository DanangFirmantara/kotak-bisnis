import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { MOTION } from './variants'

export interface FadeInProps {
  children: ReactNode
  /** Detik */
  delay?: number
  className?: string
}

/** Fade + slide-up kecil sekali saat mount. Mati total kalau user pilih reduced motion. */
export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: MOTION.offsetY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION.duration, ease: MOTION.ease, delay }}
    >
      {children}
    </motion.div>
  )
}
