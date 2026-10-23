// Service auth — pure async function. Fase UI: cek akun demo di mock, dengan delay.
// Integrasi nanti (frontend/lessons/auth-jwt.md): ganti isi `login` dengan
//   apiFetch<LoginResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
// lalu simpan token + expiresAt (BUKAN password) lewat AuthProvider. Catatan: 401 dari endpoint login berarti
// kredensial salah, bukan sesi habis — jangan ikut redirect auto-logout di apiFetch.
import { ApiError } from '@/lib/api'
import { DEMO_ACCOUNT, demoUserMock } from '@/mocks/auth'
import type { LoginInput } from '@/schemas/auth.schema'
import type { LoginResponse } from '@/types/auth'

const MOCK_DELAY_MS = 600

/** Fase UI saja: teks akun demo di bawah kartu login (komponen tidak boleh impor mock langsung). Hapus bersama mock. */
export const DEMO_LOGIN_HINT = `Akun demo: ${DEMO_ACCOUNT.email} · ${DEMO_ACCOUNT.password}`

export const authService = {
  login: ({ email, password }: LoginInput): Promise<LoginResponse> =>
    new Promise((resolve, reject) =>
      setTimeout(() => {
        const valid = email.toLowerCase() === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password
        if (valid) resolve({ user: structuredClone(demoUserMock) })
        else reject(new ApiError(401, 'Email atau kata sandi salah'))
      }, MOCK_DELAY_MS),
    ),
}
