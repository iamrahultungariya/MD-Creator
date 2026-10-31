import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30s cache for fast local navigation; DB mutations invalidate explicitly
      refetchOnMount: false, // Respect staleTime on mount, eliminate redundant IndexedDB round-trips
      refetchOnWindowFocus: false, // Offline-first IndexedDB: prevent aggressive refetches on focus/tab switch
      retry: 1
    }
  }
});
