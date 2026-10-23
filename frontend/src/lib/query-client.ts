import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // pindah halaman tidak spam request (lesson api-integration)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
