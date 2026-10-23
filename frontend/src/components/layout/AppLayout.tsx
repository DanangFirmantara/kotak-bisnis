import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { FadeIn } from '@/components/motion/FadeIn'
import { ENTRANCE_DELAY } from '@/components/motion/variants'
import { PAGE_GUTTER } from '@/lib/responsive'
import { cn } from '@/lib/utils'
import { AppFooter } from './AppFooter'
import { BackgroundBlobs } from './BackgroundBlobs'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { RouteFallback } from './RouteFallback'
import { Sidebar } from './Sidebar'

/**
 * Shell semua halaman: background blob, sidebar ikon (sticky, ≥ md) / bottom nav (< md), header, lalu konten route.
 * Page di-lazy-load (router.tsx) → Suspense di sini, jadi shell tampil & beranimasi duluan.
 */
export function AppLayout() {
  return (
    // pb HP: ruang bottom nav (56px + jarak 16px) + napas + safe-area iOS. overflow-x-clip = jaring pengaman saja
    // (bukan scroll container → sidebar sticky tetap jalan).
    <div
      className={cn(
        'flex min-h-dvh gap-4 overflow-x-clip pb-[calc(7rem_+_env(safe-area-inset-bottom))] md:pb-4 lg:gap-6',
        PAGE_GUTTER,
      )}
    >
      <BackgroundBlobs />

      <FadeIn
        delay={ENTRANCE_DELAY.sidebar}
        className="sticky top-4 hidden h-[calc(100dvh-2rem)] shrink-0 md:block lg:top-6 lg:h-[calc(100dvh-3rem)]"
      >
        <Sidebar />
      </FadeIn>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <FadeIn delay={ENTRANCE_DELAY.header}>
          <Header />
        </FadeIn>
        <main className="flex-1">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
        <FadeIn delay={ENTRANCE_DELAY.footer}>
          <AppFooter />
        </FadeIn>
      </div>

      <FadeIn
        delay={ENTRANCE_DELAY.sidebar}
        className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-40 md:hidden"
      >
        <MobileNav />
      </FadeIn>
    </div>
  )
}
