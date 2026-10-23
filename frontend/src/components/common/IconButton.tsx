import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Hint, type HintSide } from './Hint'
import { iconButtonVariants } from './icon-button-variants'

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof iconButtonVariants> {
  icon: LucideIcon
  /** Wajib — nama untuk screen reader sekaligus isi tooltip */
  label: string
  /** Titik notifikasi di pojok kanan atas */
  showBadge?: boolean
  /** Posisi tooltip label (default bawah) */
  tooltipSide?: HintSide
}

export function IconButton({
  icon: Icon,
  label,
  showBadge = false,
  tooltipSide = 'bottom',
  variant,
  size,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <Hint label={label} side={tooltipSide}>
      <button
        type={type}
        aria-label={label}
        className={cn(iconButtonVariants({ variant, size }), className)}
        {...rest}
      >
        <Icon aria-hidden strokeWidth={1.8} />
        {showBadge && (
          <span
            aria-hidden
            className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger ring-2 ring-white"
          />
        )}
      </button>
    </Hint>
  )
}
