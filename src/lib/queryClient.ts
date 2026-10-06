import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Offline-first Dexie IndexedDB queries have 0 network latency, keep immediately reactive
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      retry: 1
    }
  }
});
