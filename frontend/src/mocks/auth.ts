import type { AuthUser, UserRole } from '@/types/auth'

/**
 * Fase UI: role user "login" dummy. Dibaca hanya oleh `hooks/useCurrentRole.ts`.
 * Nanti diganti role dari token JWT (useAuth) — hapus file ini saat itu.
 */
export const CURRENT_USER_ROLE: UserRole = 'OWNER'

/**
 * Fase UI: satu akun demo untuk halaman login (dibaca hanya oleh `services/auth.service.ts`).
 * Bukan kredensial asli — dicek di client hanya untuk mencoba alur sukses/gagal. Hapus saat auth JWT dibuat.
 */
export const DEMO_ACCOUNT = {
  email: 'admin@kotakbisnis.id',
  password: 'Admin@123',
} as const

export const demoUserMock: AuthUser = {
  id: 1,
  name: 'Admin Kotak Bisnis',
  email: DEMO_ACCOUNT.email,
  role: CURRENT_USER_ROLE,
}
