// Service health — pure async function. Fase UI: metadata build asli + sisanya mock, dengan delay.
// Integrasi nanti: ambil status backend dari endpoint (mis. apiFetch('/api/health') atau /actuator/health),
// gabungkan dengan APP_VERSION/BUILD_TIME — signature getHealth() tetap.
import { APP_VERSION, BUILD_TIME } from '@/lib/app-meta'
import { healthMock } from '@/mocks/health'
import type { HealthInfo } from '@/types/health'

const MOCK_DELAY_MS = 250

export const healthService = {
  getHealth: (): Promise<HealthInfo> =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            ...structuredClone(healthMock),
            version: APP_VERSION,
            buildTime: BUILD_TIME,
            checkedAt: new Date().toISOString(),
          }),
        MOCK_DELAY_MS,
      ),
    ),
}
