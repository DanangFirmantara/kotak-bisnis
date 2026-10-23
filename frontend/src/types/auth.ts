/** Peran user — samakan dengan enum Role backend saat auth JWT dibuat. */
export type UserRole = 'OWNER' | 'ADMIN' | 'STAFF'

/** Profil ringkas user login — nanti mirror DTO `UserResponse` backend. */
export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
}

/**
 * Response login. Fase UI: hanya `user`.
 * Nanti (auth JWT): + `token`, `expiresIn` (detik) — lihat frontend/lessons/auth-jwt.md.
 */
export interface LoginResponse {
  user: AuthUser
}
