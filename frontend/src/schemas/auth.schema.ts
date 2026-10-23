import { z } from 'zod'

/** Panjang minimum kata sandi — samakan dengan validasi backend saat auth dibuat. */
export const PASSWORD_MIN_LENGTH = 8

/** Form login. Pesan error bahasa Indonesia, tampil per field. */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email wajib diisi')
    .pipe(z.email('Format email tidak valid')),
  password: z
    .string()
    .min(1, 'Kata sandi wajib diisi')
    .min(PASSWORD_MIN_LENGTH, `Kata sandi minimal ${PASSWORD_MIN_LENGTH} karakter`),
  remember: z.boolean(),
})

export type LoginInput = z.infer<typeof loginSchema>
