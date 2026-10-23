import type { ReactNode } from 'react'
import { StateMessage } from '@/components/common/StateMessage'

/** Subset hasil `useQuery` yang dibutuhkan — cocok dengan UseQueryResult TanStack. */
export interface QueryLike<T> {
  data: T | undefined
  isPending: boolean
  isError: boolean
  refetch: () => unknown
}

interface StateText {
  title: string
  description?: string
}

export interface QueryStateProps<T> {
  query: QueryLike<T>
  /** Skeleton (bentuk mirip konten akhir) */
  loading: ReactNode
  /** Teks screen reader saat loading, mis. "Memuat profil…" */
  loadingLabel: string
  loadingClassName?: string
  error: StateText
  /** Kondisi kosong; tanpa ini data selalu dianggap ada */
  empty?: StateText & { when: (data: T) => boolean }
  /** Class untuk StateMessage error/empty (mis. tinggi minimum) */
  stateClassName?: string
  onDark?: boolean
  children: (data: T) => ReactNode
}

/**
 * Satu pola loading → error → empty → konten untuk semua kartu yang fetch data.
 * Dipasang DI DALAM kartu (StaggerItem/GlassCard tetap sama) → animasi masuk tidak terulang saat data tiba.
 */
export function QueryState<T>({
  query,
  loading,
  loadingLabel,
  loadingClassName,
  error,
  empty,
  stateClassName,
  onDark,
  children,
}: QueryStateProps<T>) {
  if (query.isPending) {
    return (
      <div aria-busy="true" className={loadingClassName}>
        <span className="sr-only">{loadingLabel}</span>
        {loading}
      </div>
    )
  }

  if (query.isError || query.data === undefined) {
    return (
      <StateMessage
        tone="error"
        title={error.title}
        description={error.description}
        onRetry={() => void query.refetch()}
        onDark={onDark}
        className={stateClassName}
      />
    )
  }

  if (empty?.when(query.data)) {
    return (
      <StateMessage
        tone="empty"
        title={empty.title}
        description={empty.description}
        onDark={onDark}
        className={stateClassName}
      />
    )
  }

  return children(query.data)
}
