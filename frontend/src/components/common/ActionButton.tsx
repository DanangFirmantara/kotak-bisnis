import type { ComponentProps } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { actionButtonVariants } from './action-button-variants'

export interface ActionButtonProps
  extends Omit<ComponentProps<typeof Button>, 'variant' | 'size'>,
    VariantProps<typeof actionButtonVariants> {}

/**
 * Tombol aksi pill (sage) di kartu: "Tambah kartu", "Perbarui keamanan", "Kembali ke Dashboard".
 * Turunan shadcn `Button` → focus ring, disabled, `asChild` ikut.
 */
export function ActionButton({ tone, className, ...rest }: ActionButtonProps) {
  return <Button className={cn(actionButtonVariants({ tone }), className)} {...rest} />
}
