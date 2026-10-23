// Satu pintu semua request ke backend (lihat frontend/lessons/auth-jwt.md & api-integration.md).
// Fase saat ini: belum dipakai — service masih return mock.

export const TOKEN_KEY = 'auth_token'
export const USER_KEY = 'auth_user'
export const EXP_KEY = 'auth_expires' // epoch ms, BUKAN durasi

/** Halaman login — tujuan redirect 401 dan tombol Keluar. */
export const LOGIN_PATH = '/login'

/** Pesan error yang aman ditampilkan ke user (Error/ApiError → message; selain itu fallback). */
export function getErrorMessage(error: unknown, fallback = 'Terjadi kesalahan. Coba lagi.'): string {
  return error instanceof Error && error.message ? error.message : fallback
}

export class ApiError extends Error {
  readonly status: number
  readonly detail?: unknown

  constructor(status: number, message: string, detail?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(EXP_KEY)
}

function readProblemDetail(body: unknown): string | undefined {
  if (typeof body === 'object' && body !== null && 'detail' in body) {
    const { detail } = body as { detail: unknown }
    return typeof detail === 'string' ? detail : undefined
  }
  return undefined
}

/** Path relatif (`/api/...`) → lewat Vite proxy di dev, same-origin di production. */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    // 401 = sesi habis → logout. 403 TIDAK logout (tampilkan "tidak punya akses").
    clearAuth()
    window.location.assign(LOGIN_PATH)
    throw new ApiError(401, 'Sesi berakhir')
  }

  if (!res.ok) {
    const problem: unknown = await res.json().catch(() => null) // ProblemDetail dari backend
    throw new ApiError(res.status, readProblemDetail(problem) ?? `API error ${res.status}`, problem)
  }

  return (res.status === 204 ? undefined : await res.json()) as T
}
