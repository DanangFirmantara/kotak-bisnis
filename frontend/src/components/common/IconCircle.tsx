import type { LucideIcon } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const iconCircleVariants = cva('inline-flex shrink-0 items-center justify-center rounded-full', {
  variants: {
    variant: {
      soft: 'border border-glass-border bg-sage-50 text-sage-dark',
      dark: 'bg-ink text-white shadow-glass',
      onDark: 'bg-white/20 text-white',
    },
    size: {
      sm: 'size-8 [&_svg]:size-4',
      md: 'size-10 [&_svg]:size-[18px]',
      lg: 'size-12 [&_svg]:size-6',
    },
  },
  defaultVariants: { variant: 'soft', size: 'md' },
})

export interface IconCircleProps extends VariantProps<typeof iconCircleVariants> {
  icon: LucideIcon
  /** Isi kalau ikon bermakna (mis. logo); tanpa label = dekoratif (aria-hidden) */
  label?: string
  className?: string
}

/** Ikon non-interaktif dalam lingkaran (ikon kartu statistik, logo sidebar). */
export function IconCircle({ icon: Icon, label, variant, size, className }: IconCircleProps) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(iconCircleVariants({ variant, size }), className)}
    >
      <Icon aria-hidden strokeWidth={1.8} />
    </span>
  )
}
