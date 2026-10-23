import { Link } from 'react-router'
import { CircleHelp, ShieldX } from 'lucide-react'
import { ActionButton } from '@/components/common/ActionButton'
import { DashboardLinkButton } from '@/components/common/DashboardLinkButton'
import { StatusView } from '@/components/common/StatusView'

/** 403 — user sudah login tapi role-nya tidak punya izin ke halaman (tujuan redirect `RequireRole`). */
export function AccessDeniedPage() {
  return (
    <StatusView
      code="403"
      tone="danger"
      icon={ShieldX}
      title="Akses ditolak"
      description="Akunmu tidak punya izin untuk membuka halaman ini. Kalau kamu butuh akses, hubungi Admin usahamu untuk menambahkan peran yang sesuai."
      actions={
        <>
          <DashboardLinkButton />
          <ActionButton asChild tone="glass">
            <Link to="/bantuan">
              <CircleHelp aria-hidden />
              Pusat Bantuan
            </Link>
          </ActionButton>
        </>
      }
    />
  )
}
