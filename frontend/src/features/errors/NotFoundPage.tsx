import { useLocation, useNavigate } from 'react-router'
import { ArrowLeft, MapPinOff } from 'lucide-react'
import { ActionButton } from '@/components/common/ActionButton'
import { DashboardLinkButton } from '@/components/common/DashboardLinkButton'
import { StatusView } from '@/components/common/StatusView'

/** 404 — route `*` di dalam StandaloneLayout (tanpa sidebar): path yang diakses tidak terdaftar. */
export function NotFoundPage() {
  const { pathname, key } = useLocation()
  const navigate = useNavigate()
  // key "default" = halaman pertama di tab ini (dibuka langsung) → tidak ada riwayat in-app untuk -1
  const goBack = () => void (key === 'default' ? navigate('/') : navigate(-1))

  return (
    <StatusView
      code="404"
      tone="warning"
      icon={MapPinOff}
      title="Halaman tidak ditemukan"
      description="Alamat yang kamu buka tidak ada atau sudah dipindahkan. Periksa lagi tautannya, atau kembali ke Dashboard."
      detail={
        <code className="inline-block max-w-full truncate rounded-full border border-glass-border bg-glass-strong px-3 py-1 text-xs text-ink-muted">
          {pathname}
        </code>
      }
      actions={
        <>
          <DashboardLinkButton />
          <ActionButton tone="glass" onClick={goBack}>
            <ArrowLeft aria-hidden />
            Halaman sebelumnya
          </ActionButton>
        </>
      }
    />
  )
}
