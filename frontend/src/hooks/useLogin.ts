import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authService } from '@/services/auth.service'

/**
 * Mutation login. Sukses → ke dashboard (replace: tombol Back tidak kembali ke form login).
 * Fase UI: tidak menyimpan apa pun. Nanti: simpan token via AuthProvider/useAuth sebelum navigate,
 * dan arahkan ke `location.state.from` bila datang dari ProtectedRoute (lihat lessons/auth-jwt.md).
 */
export function useLogin() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      void navigate('/', { replace: true })
    },
  })
}
