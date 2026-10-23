import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useCurrentRole } from '@/hooks/useCurrentRole'
import type { UserRole } from '@/types/auth'

/** Path halaman 403 — tujuan redirect saat role tidak cocok. */
export const ACCESS_DENIED_PATH = '/akses-ditolak'

export interface RequireRoleProps {
  /** Role yang boleh membuka halaman */
  roles: readonly UserRole[]
  children: ReactNode
}

/**
 * Guard role per halaman: role user tidak ada di `roles` → redirect ke 403 (replace, tidak menumpuk history).
 *
 * PLACEHOLDER fase UI — role dari `useCurrentRole()` (konstanta dummy `CURRENT_USER_ROLE` di mocks/auth.ts).
 * Akan diganti auth JWT (lihat frontend/lessons/auth-jwt.md): cukup ubah isi `useCurrentRole` ke `useAuth()`;
 * belum login → redirect ke /login ditangani ProtectedRoute, bukan komponen ini.
 */
export function RequireRole({ roles, children }: RequireRoleProps) {
  const role = useCurrentRole()
  if (!roles.includes(role)) return <Navigate to={ACCESS_DENIED_PATH} replace />
  return children
}
