import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard.service'
import type { BalancePeriod, DashboardData } from '@/types/dashboard'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  balance: (period: BalancePeriod) => [...dashboardKeys.all, 'balance', period] as const,
}

/** Semua kartu dashboard kecuali Saldo (yang punya filter periode sendiri). */
export function useDashboardData() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: dashboardService.getDashboard,
  })
}

/**
 * Potongan data dashboard untuk satu kartu/area. Satu query & cache yang sama dengan
 * `useDashboardData` (tidak ada fetch ganda) — hanya re-render kalau potongannya berubah.
 * `select` harus fungsi stabil (deklarasi di level modul).
 */
function useDashboardSlice<T>(select: (data: DashboardData) => T) {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: dashboardService.getDashboard,
    select,
  })
}

const selectStats = (d: DashboardData) => d.stats
const selectEarnings = (d: DashboardData) => d.earnings
const selectProfile = (d: DashboardData) => d.profile
const selectInbox = (d: DashboardData) => d.inbox
const selectCards = (d: DashboardData) => d.cards
const selectTransfers = (d: DashboardData) => d.transfers
const selectSecurity = (d: DashboardData) => d.security

export const useDashboardStats = () => useDashboardSlice(selectStats)
export const useEarningsSummary = () => useDashboardSlice(selectEarnings)
export const useOwnerProfile = () => useDashboardSlice(selectProfile)
export const useInbox = () => useDashboardSlice(selectInbox)
export const useBusinessCards = () => useDashboardSlice(selectCards)
export const useTransfers = () => useDashboardSlice(selectTransfers)
export const useSecurityStatus = () => useDashboardSlice(selectSecurity)

/** Kartu Saldo — queryKey memuat `period` supaya ganti filter = data baru. */
export function useBalanceOverview(period: BalancePeriod) {
  return useQuery({
    queryKey: dashboardKeys.balance(period),
    queryFn: () => dashboardService.getBalance(period),
    placeholderData: keepPreviousData, // chart tidak kedip saat ganti filter
  })
}
