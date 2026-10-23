import { Link } from 'react-router'
import { LayoutDashboard } from 'lucide-react'
import { ActionButton, type ActionButtonProps } from './ActionButton'

export interface DashboardLinkButtonProps {
  label?: string
  tone?: ActionButtonProps['tone']
  className?: string
}

/** Tombol pill "Kembali ke Dashboard" (Link ke `/`) — dipakai halaman status (404/403/segera hadir) & health. */
export function DashboardLinkButton({ label = 'Kembali ke Dashboard', tone, className }: DashboardLinkButtonProps) {
  return (
    <ActionButton asChild tone={tone} className={className}>
      <Link to="/">
        <LayoutDashboard aria-hidden />
        {label}
      </Link>
    </ActionButton>
  )
}
