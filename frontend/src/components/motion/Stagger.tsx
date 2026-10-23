import type { ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { fadeUpVariants, MOTION } from './variants'

interface StaggerProps {
  children: ReactNode
  className?: string
  /** Jeda antar anak (detik), default ±70ms */
  stagger?: number
  /** Jeda sebelum anak pertama (detik) */
  delay?: number
}

/**
 * Container animasi bertahap. Anak yang ikut animasi dibungkus `StaggerItem`.
 * <Stagger className="grid ..."><StaggerItem>...</StaggerItem></Stagger>
 */
export function Stagger({ children, className, stagger = MOTION.stagger, delay = 0 }: StaggerProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <div className={className}>{children}</div>

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  }

  return (
    <motion.div className={className} variants={container} initial="hidden" animate="visible">
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <div className={className}>{children}</div>

  return (
    <motion.div className={className} variants={fadeUpVariants}>
      {children}
    </motion.div>
  )
}
