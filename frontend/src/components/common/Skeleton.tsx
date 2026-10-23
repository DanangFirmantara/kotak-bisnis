import { cn } from '@/lib/utils'

export interface SkeletonProps {
  /** Ukuran & bentuk lewat class, mis. "h-4 w-24" atau "size-10 rounded-full" */
  className?: string
  /** Di atas kartu highlight (sage) */
  onDark?: boolean
}

/**
 * Blok placeholder kaca saat loading. Pulse hanya kalau user tidak memilih reduced motion.
 * Dekoratif (aria-hidden) — pasang `aria-busy` + teks sr-only di container pemanggil.
 */
export function Skeleton({ className, onDark = false }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'rounded-xl motion-safe:animate-pulse',
        onDark ? 'bg-white/25' : 'bg-white/60 ring-1 ring-glass-line',
        className,
      )}
    />
  )
}
