import { cva } from 'class-variance-authority'

/**
 * Gaya tombol aksi pill di kartu dashboard (di atas `buttonVariants` shadcn — class di sini menimpa via `cn`).
 * Dipisah dari komponen supaya bisa dipakai elemen lain (mis. `Link` lewat `asChild`).
 */
export const actionButtonVariants = cva(
  'h-10 gap-2 rounded-full px-5 text-sm font-semibold shadow-glass [&_svg:not([class*=size-])]:size-4',
  {
    variants: {
      tone: {
        sage: 'bg-sage text-white hover:bg-sage-600',
        glass: 'border-glass-border bg-glass-strong text-ink backdrop-blur-xl hover:bg-white',
      },
    },
    defaultVariants: { tone: 'sage' },
  },
)
