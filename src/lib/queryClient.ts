import { QueryClient } from "@tanstack/react-query";

// I dati restano "freschi" per 60s: navigare tra pagine entro questa finestra
// non ri-scatena la fetch, la UI mostra subito i dati già in cache.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
