import type { BusinessCard } from '@/types/dashboard'
import { GlassPaymentCard } from '@/components/common/GlassPaymentCard'
import { Tilt } from '@/components/motion/Tilt'
import { cn } from '@/lib/utils'

const MAX_STACK = 3
/** Geser per lapis kartu di belakang: ke kanan-atas + mundur (translateZ) */
const LAYER = { x: 14, y: -12, z: -36, scale: 0.04 }

/** Tumpukan ≤3 kartu glass dalam satu permukaan Tilt; kartu [0] paling depan. */
export function WalletCardStack({ cards, className }: { cards: BusinessCard[]; className?: string }) {
  const stack = cards.slice(0, MAX_STACK)

  return (
    // HP: max-w-64 supaya kartu belakang (geser kanan-atas) + rotasi 3D tidak keluar padding kartu di layar 360px
    <Tilt className={cn('w-full max-w-64 sm:max-w-72', className)} baseRotateX={14} baseRotateY={-18} maxTilt={9}>
      <div className="relative aspect-[1.586] w-full transform-3d">
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
                transform: `translate3d(${depth * LAYER.x}px, ${depth * LAYER.y}px, ${depth * LAYER.z}px) scale(${1 - depth * LAYER.scale})`,
              }}
            />
          ))}
      </div>
    </Tilt>
  )
}
