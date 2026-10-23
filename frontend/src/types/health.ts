/** Status ala Spring Boot Actuator (`/actuator/health` → "UP" | "DOWN" | "UNKNOWN"). */
export type HealthStatus = 'UP' | 'DOWN' | 'UNKNOWN'

export interface ComponentHealth {
  status: HealthStatus
  /** Keterangan singkat, mis. "Belum tersambung" */
  detail?: string
}

/** Info halaman /health — gabungan metadata build frontend + status layanan. */
export interface HealthInfo {
  /** Status keseluruhan aplikasi */
  status: HealthStatus
  version: string
  /** ISO 8601 */
  buildTime: string
  environment: string
  /** Hash commit pendek */
  commit: string
  frontend: ComponentHealth
  backend: ComponentHealth
  /** ISO 8601 — kapan data ini diambil */
  checkedAt: string
}
