// Service dashboard — pure async function. Fase UI: return mock dengan delay.
// Integrasi API nanti: ganti isi fungsi ke apiFetch (signature tetap), mis.
//   getDashboard: () => apiFetch<DashboardData>('/api/dashboard')
//   getBalance: (period) => apiFetch<BalanceOverview>(`/api/dashboard/balance?period=${period}`)
import { balanceMock, dashboardMock } from '@/mocks/dashboard'
import type { BalanceOverview, BalancePeriod, DashboardData } from '@/types/dashboard'

const MOCK_DELAY_MS = 300

function withDelay<T>(data: T, ms: number = MOCK_DELAY_MS): Promise<T> {
  // structuredClone: cegah komponen memutasi objek mock bersama
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), ms))
}

export const dashboardService = {
  getDashboard: (): Promise<DashboardData> => withDelay(dashboardMock),
  getBalance: (period: BalancePeriod): Promise<BalanceOverview> => withDelay(balanceMock[period]),
}
