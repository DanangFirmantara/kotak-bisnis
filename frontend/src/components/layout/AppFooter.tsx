import { getCopyright } from '@/lib/app-meta'
import { cn } from '@/lib/utils'

interface AppFooterProps {
  className?: string
}

/** Footer copyright tipis di bawah konten — dipasang sekali di AppLayout. */
export function AppFooter({ className }: AppFooterProps) {
  return (
    <footer className={cn('border-t border-glass-border pt-4 pb-1 text-center text-xs text-ink-muted', className)}>
      <p>{getCopyright()}</p>
    </footer>
  )
}
