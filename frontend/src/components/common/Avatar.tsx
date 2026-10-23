import { BadgeCheck } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'

const avatarVariants = cva(
  'inline-flex shrink-0 select-none items-center justify-center rounded-full bg-linear-to-br from-sage-200 to-sage-300 font-semibold text-sage-deep ring-2 ring-white/80',
  {
    variants: {
      size: {
        sm: 'size-8 text-xs',
        md: 'size-11 text-sm',
        lg: 'size-20 text-2xl',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

const badgeSize = { sm: 'size-3.5', md: 'size-4', lg: 'size-6' } as const

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  name: string
  /** Badge centang kecil di pojok kanan bawah */
  verified?: boolean
  className?: string
}

/** Avatar inisial (tanpa gambar), opsional badge terverifikasi. */
export function Avatar({ name, size, verified = false, className }: AvatarProps) {
  const label = verified ? `${name} (terverifikasi)` : name

  return (
    <span role="img" aria-label={label} className={cn('relative', avatarVariants({ size }), className)}>
      {getInitials(name)}
      {verified && (
        <BadgeCheck
          aria-hidden
          strokeWidth={2}
          className={cn(
            'absolute -right-0.5 -bottom-0.5 rounded-full bg-white fill-success-soft text-sage-dark',
            badgeSize[size ?? 'md'],
          )}
        />
      )}
    </span>
  )
}
