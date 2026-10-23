import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { FadeIn } from '@/components/motion/FadeIn'
import { ENTRANCE_DELAY } from '@/components/motion/variants'
import { PAGE_GUTTER } from '@/lib/responsive'
import { cn } from '@/lib/utils'
import { AppFooter } from './AppFooter'
import { BackgroundBlobs } from './BackgroundBlobs'
import { RouteFallback } from './RouteFallback'

/**
 * Layout tanpa shell (tanpa sidebar/header/bottom nav): background blob, konten terpusat, footer.
 * Dipakai `/health` (publik) dan halaman error 403 (`/akses-ditolak`) & 404 (`*`).
 * Jangan pasang guard auth di layout ini — /health harus tetap bisa dibuka tanpa login.
 */
export function StandaloneLayout() {
  return (
    <div
      className={cn(
        'flex min-h-dvh flex-col gap-6 overflow-x-clip pb-[max(1rem,env(safe-area-inset-bottom))]',
        PAGE_GUTTER,
      )}
    >
      <BackgroundBlobs />
      <main className="flex flex-1 items-center justify-center">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <FadeIn delay={ENTRANCE_DELAY.footer}>
        <AppFooter />
      </FadeIn>
    </div>
  )
}
