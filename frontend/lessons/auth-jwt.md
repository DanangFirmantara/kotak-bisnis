# Lesson: Auth JWT di React (Vite SPA) — Kotak Bisnis

> Sumber awal: lesson `auth-middleware.md` Undanganku (Next.js), diadaptasi ke Vite + React Router (tanpa `"use client"`/Server Component).

## Storage keys (standar project)
```ts
export const TOKEN_KEY = 'auth_token'
export const USER_KEY = 'auth_user'
export const EXP_KEY = 'auth_expires'   // epoch ms, BUKAN durasi
```

## `apiFetch` — satu pintu semua request (`src/lib/api.ts`)
```ts
// TS 6 + `erasableSyntaxOnly` (default create-vite): constructor parameter property
// (`constructor(public status: number)`) DILARANG → tulis field eksplisit.
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
    clearAuth()
    window.location.assign('/login')
    throw new ApiError(401, 'Sesi berakhir')
  }
  if (!res.ok) {
    const problem = await res.json().catch(() => null)   // ProblemDetail dari backend
    throw new ApiError(res.status, problem?.detail ?? `API error ${res.status}`, problem)
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}
```
- Path relatif (`/api/...`) → lewat Vite proxy di dev, same-origin di production (lihat `api-integration.md`)
- 401 = sesi habis → logout. **403 jangan** di-logout — tampilkan "tidak punya akses"
- **Kecuali endpoint login:** 401 dari `/api/auth/login` = kredensial salah, bukan sesi habis. Kalau ikut
  handler 401 di atas, user di-redirect ke /login tanpa melihat pesan error → beri pengecualian path login di
  `apiFetch` (atau service login pakai fetch tanpa handler 401). Error ditampilkan via `FormAlert`

## Auto-logout
- Simpan `expiresAt` (epoch ms). Saat app mount: `msLeft = expiresAt - Date.now()`; `> 0` → reschedule timer, `<= 0` → `clearAuth()`
- Redirect ke `/login` dari timer callback, bukan saat mount di halaman publik
- Durasi token (15 menit) mengikuti backend — jangan hardcode beda; ambil dari `expiresIn` response login

## Auth state
- `AuthProvider` (Context) + hook `useAuth()` → `{ user, isAuthenticated, login, logout }`
- `ProtectedRoute` di router membungkus `AppLayout`:
```tsx
function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}
```
- Setelah logout: `queryClient.clear()` supaya cache TanStack Query user sebelumnya tidak bocor

## Catatan
- Services = pure async function (tanpa React hook di dalamnya)
- Jangan simpan password atau data sensitif lain di localStorage — cukup token + profil ringkas
