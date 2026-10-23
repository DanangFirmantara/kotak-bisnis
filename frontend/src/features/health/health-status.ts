import type { StatusDotTone } from '@/components/common/StatusDot'
import { APP_NAME } from '@/lib/app-meta'
import type { HealthInfo, HealthStatus } from '@/types/health'

/** Label & warna titik per status — satu sumber untuk badge dan baris layanan. */
export const HEALTH_STATUS_META: Record<HealthStatus, { label: string; tone: StatusDotTone }> = {
  UP: { label: 'Sehat', tone: 'success' },
  DOWN: { label: 'Gangguan', tone: 'danger' },
  UNKNOWN: { label: 'Tidak diketahui', tone: 'muted' },
}

/** JSON ringkas untuk tombol "Salin info" (lampiran laporan bug / tiket deploy). */
export function toHealthSummary(info: HealthInfo): string {
  return JSON.stringify(
    {
      app: APP_NAME,
      status: info.status,
      version: info.version,
      buildTime: info.buildTime,
      environment: info.environment,
      commit: info.commit,
      frontend: info.frontend.status,
      backend: info.backend.status,
      checkedAt: info.checkedAt,
    },
    null,
    2,
  )
}
