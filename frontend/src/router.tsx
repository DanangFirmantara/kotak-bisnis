import { lazy, type ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import { ACCESS_DENIED_PATH, RequireRole } from '@/components/auth/RequireRole'
import { AppLayout } from '@/components/layout/AppLayout'
import { ALL_NAV } from '@/components/layout/nav-items'
import { StandaloneLayout } from '@/components/layout/StandaloneLayout'
import { RouteErrorPage } from '@/features/errors/RouteErrorPage'
import { LOGIN_PATH } from '@/lib/api'
import { isChunkLoadError, reloadOnceForStaleChunk } from '@/lib/chunk-reload'

/**
 * React.lazy untuk page dengan named export → tiap halaman jadi chunk sendiri
 * (recharts dll. tidak ikut bundle awal). Suspense-nya ada di AppLayout / StandaloneLayout.
 */
function lazyPage<K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(() =>
    load()
      .then((mod) => ({ default: mod[name] }))
      .catch((error: unknown) => {
        // Chunk hash lama hilang setelah redeploy → reload sekali; kalau ditahan guard / error lain → RouteErrorPage
        if (isChunkLoadError(error)) reloadOnceForStaleChunk()
        throw error
      }),
  )
}

const DashboardPage = lazyPage(() => import('@/features/dashboard/DashboardPage'), 'DashboardPage')
const TransaksiPage = lazyPage(() => import('@/features/transaksi/TransaksiPage'), 'TransaksiPage')
const HelpPage = lazyPage(() => import('@/features/help/HelpPage'), 'HelpPage')
const ComingSoonPage = lazyPage(() => import('@/features/coming-soon/ComingSoonPage'), 'ComingSoonPage')
const AccessDeniedPage = lazyPage(() => import('@/features/errors/AccessDeniedPage'), 'AccessDeniedPage')
const NotFoundPage = lazyPage(() => import('@/features/errors/NotFoundPage'), 'NotFoundPage')
const HealthPage = lazyPage(() => import('@/features/health/HealthPage'), 'HealthPage')
const LoginPage = lazyPage(() => import('@/features/auth/LoginPage'), 'LoginPage')

/** Halaman yang sudah dibuat di dalam shell. Tambah halaman menu baru DI SINI → route "segera hadir"-nya hilang otomatis. */
const appRoutes: RouteObject[] = [
  { index: true, element: <DashboardPage /> },
  { path: 'transaksi', element: <TransaksiPage /> },
  { path: 'bantuan', element: <HelpPage /> },
  {
    // Demo alur 403: role dummy (OWNER) tidak termasuk → RequireRole redirect ke /akses-ditolak
    path: 'demo-akses-ditolak',
    element: (
      <RequireRole roles={['ADMIN']}>
        <HelpPage />
      </RequireRole>
    ),
  },
]

const builtPaths = new Set(appRoutes.map((route) => (route.index ? '/' : `/${route.path}`)))

/** Menu sidebar yang belum punya halaman → ComingSoonPage (di-generate dari config nav, bukan ditulis satu-satu). */
const comingSoonRoutes: RouteObject[] = ALL_NAV.filter((item) => !builtPaths.has(item.to)).map((item) => ({
  path: item.to.slice(1),
  element: <ComingSoonPage />,
}))

export const router = createBrowserRouter([
  {
    // TODO(auth JWT): bungkus dengan ProtectedRoute (belum login → /login, lihat frontend/lessons/auth-jwt.md).
    // Fase UI (UAM belum ada): dashboard sengaja tetap bisa dibuka tanpa login.
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [...appRoutes, ...comingSoonRoutes],
  },
  {
    // Tanpa sidebar/header/bottom nav: /login, /health (publik, cek versi ter-deploy) + halaman error 403/404.
    // `*` di sini aman: React Router me-ranking route statis (/, /bantuan, menu "segera hadir", /login, /health)
    // di atas splat, jadi `*` hanya menangkap path yang tidak cocok dengan route mana pun (mis. /asal, /a/b).
    element: <StandaloneLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: LOGIN_PATH.slice(1), element: <LoginPage /> },
      { path: 'health', element: <HealthPage /> },
      { path: ACCESS_DENIED_PATH.slice(1), element: <AccessDeniedPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
