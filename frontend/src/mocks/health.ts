import type { HealthInfo } from '@/types/health'

/**
 * Bagian /health yang belum punya sumber asli (hanya diimpor health.service).
 * Versi & waktu build TIDAK di sini — diinjeksi saat build (lib/app-meta.ts).
 */
export const healthMock: Pick<HealthInfo, 'status' | 'environment' | 'commit' | 'frontend' | 'backend'> = {
  status: 'UP',
  environment: 'Development',
  commit: 'a1b2c3d',
  frontend: { status: 'UP', detail: 'Berjalan normal' },
  backend: { status: 'UNKNOWN', detail: 'Belum tersambung' },
}
