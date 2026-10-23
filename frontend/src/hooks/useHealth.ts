import { useQuery } from '@tanstack/react-query'
import { healthService } from '@/services/health.service'

export const healthKeys = {
  all: ['health'] as const,
}

/** Status aplikasi untuk /health — selalu cek ulang saat halaman dibuka (bukan dari cache lama). */
export function useHealth() {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: healthService.getHealth,
    staleTime: 0,
    refetchOnMount: 'always',
  })
}
