import { isRouteErrorResponse, useRouteError } from 'react-router'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import { ActionButton } from '@/components/common/ActionButton'
import { DashboardLinkButton } from '@/components/common/DashboardLinkButton'
import { StatusView } from '@/components/common/StatusView'
import { BackgroundBlobs } from '@/components/layout/BackgroundBlobs'
import { isChunkLoadError } from '@/lib/chunk-reload'
import { PAGE_GUTTER } from '@/lib/responsive'
import { cn } from '@/lib/utils'

function errorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`
  if (error instanceof Error) return error.message
  return String(error)
}

/**
 * `errorElement` root route — error render/loader/dynamic import. Berdiri sendiri (blob + kartu terpusat):
 * layout yang gagal tidak dipakai, dan tidak bergantung pada hook data. 404 tetap ditangani route `*`.
 */
export function RouteErrorPage() {
  const error = useRouteError()
  const stale = isChunkLoadError(error)

  return (
    <div className={cn('flex min-h-dvh items-center justify-center overflow-x-clip py-6', PAGE_GUTTER)}>
      <BackgroundBlobs />
      <main className="w-full">
        <StatusView
          tone={stale ? 'warning' : 'danger'}
          icon={stale ? RefreshCw : TriangleAlert}
          title={stale ? 'Versi baru tersedia' : 'Terjadi kesalahan'}
          description={
            stale
              ? 'Versi aplikasi baru tersedia. Muat ulang halaman untuk melanjutkan.'
              : 'Halaman tidak bisa ditampilkan. Coba muat ulang, atau kembali ke Dashboard.'
          }
          detail={
            import.meta.env.DEV ? (
              <code className="block max-w-full break-words rounded-xl border border-glass-border bg-glass-strong px-3 py-2 text-left text-xs text-ink-muted">
                {errorMessage(error)}
              </code>
            ) : undefined
          }
          actions={
            <>
              <ActionButton onClick={() => window.location.reload()}>
                <RefreshCw aria-hidden />
                Muat ulang
              </ActionButton>
              <DashboardLinkButton />
            </>
          }
        />
      </main>
    </div>
  )
}
