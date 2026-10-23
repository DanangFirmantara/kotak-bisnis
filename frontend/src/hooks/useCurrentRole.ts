import { CURRENT_USER_ROLE } from '@/mocks/auth'
import type { UserRole } from '@/types/auth'

/**
 * Role user yang sedang login. Fase UI: konstanta dummy dari `mocks/auth.ts`.
 * Nanti: ambil dari `useAuth()` (claim role di JWT) — signature tetap, pemakai tidak berubah.
 */
export function useCurrentRole(): UserRole {
  return CURRENT_USER_ROLE
}
