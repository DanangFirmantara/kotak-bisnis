import type { BusinessCard } from '@/types/dashboard'
import { GlassPaymentCard } from '@/components/common/GlassPaymentCard'
import { Tilt } from '@/components/motion/Tilt'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { MEDIA_QUERY } from '@/lib/responsive'
import { cn } from '@/lib/utils'

const MAX_STACK = 3
/** Geser per lapis kartu di belakang: ke kanan-atas + mundur (translateZ) */
const LAYER_DESKTOP = { x: 14, y: -12, z: -36, scale: 0.04 }
/** HP (< sm): offset & kedalaman lebih kecil supaya bounding box 3D muat di dalam kartu pembungkus */
const LAYER_MOBILE = { x: 9, y: -8, z: -22, scale: 0.04 }
/** Pose diam: HP lebih landai (rotasi besar memperbesar bounding box) */
const POSE_DESKTOP = { x: 14, y: -18 }
const POSE_MOBILE = { x: 10, y: -12 }

/** Tumpukan ≤3 kartu glass dalam satu permukaan Tilt; kartu [0] paling depan. */
export function WalletCardStack({ cards, className }: { cards: BusinessCard[]; className?: string }) {
  const stack = cards.slice(0, MAX_STACK)
  const isSm = useMediaQuery(MEDIA_QUERY.sm)
  const layer = isSm ? LAYER_DESKTOP : LAYER_MOBILE
  const pose = isSm ? POSE_DESKTOP : POSE_MOBILE

  return (
    // HP: max-w-56 (224px) supaya kartu belakang (geser kanan-atas) + rotasi 3D tidak keluar border kartu di layar 360–390px
    <Tilt className={cn('w-full max-w-56 sm:max-w-72', className)} baseRotateX={pose.x} baseRotateY={pose.y} maxTilt={9}>
      {/* HP: geser kiri ±setengah offset kartu belakang supaya jarak kiri–kanan seimbang */}
      <div className="relative aspect-[1.586] w-full -translate-x-2 transform-3d sm:translate-x-0">
        {/* Dirender dari belakang ke depan supaya urutan tumpuk benar */}
        {stack
          .map((card, depth) => ({ card, depth }))
          .reverse()
          .map(({ card, depth }) => (
            <GlassPaymentCard
              key={card.id}
              holderName={card.holderName}
              maskedNumber={card.maskedNumber}
              expiry={card.expiry}
              brand={card.network}
              showDetails={depth === 0}
              className="absolute inset-0"
              style={{
                transform: `translate3d(${depth * layer.x}px, ${depth * layer.y}px, ${depth * layer.z}px) scale(${1 - depth * layer.scale})`,
              }}
            />
          ))}
      </div>
    </Tilt>
  )
}
