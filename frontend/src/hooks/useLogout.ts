import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { LOGIN_PATH } from '@/lib/api'

/**
 * Aksi keluar bersama (Sidebar desktop & AccountMenu mobile). Ke /login dengan replace
 * (Back tidak kembali ke halaman terproteksi), lalu buang cache query.
 * TODO (auth JWT): panggil clearAuth() dulu (lessons/auth-jwt.md).
 */
export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return () => {
    void navigate(LOGIN_PATH, { replace: true })
    queryClient.clear()
  }
}
