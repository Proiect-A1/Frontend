import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      // Dezactivat global: re-fetch-ul la fiecare alt-tab / focus genera
      // valuri de request-uri si lag perceptibil la navigare. Daca o pagina
      // chiar vrea refresh la focus, o setam local pe query.
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});