import type { ReactElement } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export type HintSide = 'top' | 'right' | 'bottom' | 'left'

export interface HintProps {
  label: string
  side?: HintSide
  /** Satu elemen yang bisa menerima ref + props (button, NavLink, a) */
  children: ReactElement
}

/** Label tooltip pendek (shadcn Tooltip) untuk tombol/link ikon. Butuh `TooltipProvider` (main.tsx). */
export function Hint({ label, side = 'bottom', children }: HintProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
