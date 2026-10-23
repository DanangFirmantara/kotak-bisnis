import type { CSSProperties } from 'react'
import { Boxes, Nfc } from 'lucide-react'
import { TEXT_NANO } from '@/lib/responsive'
import { cn } from '@/lib/utils'

export interface GlassPaymentCardProps {
  holderName: string
  /** Sudah di-mask, mis. "•••• •••• •••• 4821" */
  maskedNumber: string
  /** "MM/YY" */
  expiry: string
  /** Nama jaringan/brand di pojok kiri atas */
  brand: string
  /** false = kartu tumpukan di belakang (detail disembunyikan, lebih redup) */
  showDetails?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * Kartu pembayaran CSS glassmorphism (tanpa gambar), rasio kartu ISO 85.6:54.
 * Visual saja — kemiringan 3D dari pembungkus `Tilt`.
 */
export function GlassPaymentCard({
  holderName,
  maskedNumber,
  expiry,
  brand,
  showDetails = true,
  className,
  style,
}: GlassPaymentCardProps) {
  return (
    <div
      style={style}
      className={cn(
        'relative aspect-[1.586] w-full overflow-hidden rounded-2xl border border-white/70 p-4 text-ink shadow-glass-lg backdrop-blur-xl',
        showDetails
          ? 'bg-linear-to-br from-white/85 via-sage-100/80 to-blob-sky/80'
          : 'bg-linear-to-br from-white/60 via-sage-200/60 to-sage-300/60',
        className,
      )}
    >
      {/* Kilau kaca diagonal */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-1/4 -top-1/2 h-full rotate-12 bg-linear-to-b from-white/70 to-transparent"
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-sage-deep">
            <Boxes aria-hidden className="size-4" strokeWidth={2} />
            {brand}
          </span>
          {showDetails && <Nfc aria-hidden className="size-5 text-sage-dark" strokeWidth={1.8} />}
        </div>

        {showDetails && (
          <>
            <CardChip />
            <div>
              <p className="font-mono text-sm tracking-[0.18em] text-ink tabular-nums sm:text-base">{maskedNumber}</p>
              <div className={cn('mt-2 flex items-end justify-between gap-3 text-ink-muted uppercase', TEXT_NANO)}>
                <span className="truncate font-semibold tracking-wide">{holderName}</span>
                <span className="shrink-0">
                  <span className="sr-only">Berlaku sampai </span>
                  {expiry}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/** Chip EMV dekoratif (bentuk CSS, bukan ikon). */
function CardChip() {
  return (
    <div
      aria-hidden
      className="grid h-7 w-10 grid-cols-3 gap-px overflow-hidden rounded-md bg-sage-300/70 p-px ring-1 ring-white/60"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="rounded-[2px] bg-linear-to-br from-sage-100 to-sage-200" />
      ))}
    </div>
  )
}
