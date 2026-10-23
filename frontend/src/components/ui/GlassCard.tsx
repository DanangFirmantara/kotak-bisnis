import type { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const glassCardVariants = cva(
  'relative overflow-hidden rounded-3xl border p-5 backdrop-blur-xl transition-shadow',
  {
    variants: {
      variant: {
        default: 'border-glass-border bg-glass text-ink shadow-glass',
        highlight:
          'border-sage-300/40 bg-linear-to-br from-sage via-sage-600 to-sage-deep text-white shadow-glass-lg',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export type GlassCardVariant = NonNullable<VariantProps<typeof glassCardVariants>['variant']>

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassCardVariant
  children: ReactNode
}

/** Kartu kaca dasar semua kartu dashboard. `highlight` = sage gradient + teks putih. */
export function GlassCard({ variant, className, children, ...rest }: GlassCardProps) {
  return (
    <div className={cn(glassCardVariants({ variant }), className)} {...rest}>
      {children}
    </div>
  )
}
