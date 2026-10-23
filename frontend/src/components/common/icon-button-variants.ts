import { cva } from 'class-variance-authority'
import { HIT_AREA } from '@/lib/responsive'

/**
 * Di-export supaya elemen non-button (mis. `NavLink` sidebar) bisa memakai gaya yang sama.
 * HIT_AREA: ukuran `sm` (32px) tetap punya area sentuh 40px tanpa berubah tampilan.
 */
export const iconButtonVariants = cva(
  `${HIT_AREA} inline-flex shrink-0 items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      variant: {
        glass:
          'border border-glass-border bg-glass-strong text-ink-muted shadow-glass backdrop-blur-xl hover:bg-white hover:text-ink',
        solid: 'bg-sage text-white shadow-glass hover:bg-sage-600',
        dark: 'bg-ink text-white shadow-glass hover:bg-sage-deep',
        ghost: 'text-ink-muted hover:bg-sage-100 hover:text-sage-deep',
      },
      size: {
        sm: 'size-8 [&_svg]:size-4',
        md: 'size-10 [&_svg]:size-[18px]',
        lg: 'size-12 [&_svg]:size-5',
      },
    },
    defaultVariants: { variant: 'glass', size: 'md' },
  },
)
