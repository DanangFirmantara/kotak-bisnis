import type { PointerEvent, ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { MEDIA_QUERY } from '@/lib/responsive'
import { cn } from '@/lib/utils'

export interface TiltProps {
  children: ReactNode
  className?: string
  /** Kemiringan maksimum dari pointer (derajat) */
  maxTilt?: number
  /** Pose diam (derajat) — tetap dipakai saat reduced motion supaya kesan 3D tidak hilang */
  baseRotateX?: number
  baseRotateY?: number
  /** Jarak perspektif (px) */
  perspective?: number
}

const SPRING = { stiffness: 180, damping: 18, mass: 0.6 }

/**
 * Permukaan 3D yang miring mengikuti pointer (spring). Anak bisa memakai `translateZ` untuk kedalaman
 * (transform-style preserve-3d). Reduced motion / pointer kasar (layar sentuh) → pose diam saja, tanpa interaksi.
 */
export function Tilt({
  children,
  className,
  maxTilt = 10,
  baseRotateX = 0,
  baseRotateY = 0,
  perspective = 1000,
}: TiltProps) {
  const reduceMotion = useReducedMotion()
  // Layar sentuh: "ikut pointer" tidak bermakna (hanya saat jari menyeret) & bisa mengganggu scroll → pose diam
  const coarsePointer = useMediaQuery(MEDIA_QUERY.coarsePointer)
  // Posisi pointer relatif ke elemen: -0.5 … 0.5 (0 = tengah)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, SPRING)
  const sy = useSpring(py, SPRING)
  const rotateX = useTransform(sy, (v) => baseRotateX - v * maxTilt * 2)
  const rotateY = useTransform(sx, (v) => baseRotateY + v * maxTilt * 2)

  if (reduceMotion || coarsePointer) {
    return (
      <div className={className} style={{ perspective }}>
        <div
          className="size-full transform-3d"
          style={{ transform: `rotateX(${baseRotateX}deg) rotateY(${baseRotateY}deg)` }}
        >
          {children}
        </div>
      </div>
    )
  }

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width - 0.5)
    py.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleLeave = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <div className={cn('touch-pan-y', className)} style={{ perspective }} onPointerMove={handleMove} onPointerLeave={handleLeave}>
      <motion.div className="size-full transform-3d" style={{ rotateX, rotateY }}>
        {children}
      </motion.div>
    </div>
  )
}
