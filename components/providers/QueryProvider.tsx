"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { AxiosError } from "axios";
import { logger } from "@/lib/logger";
import { parseApiError } from "@/lib/types/api";

/** No reintentar errores 4xx (son errores del cliente, no transitorios). */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    if (status && status >= 400 && status < 500) return false;
  }
  return failureCount < 1; // máximo 1 reintento para 5xx / red
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            const parsed = parseApiError(error);
            logger.error(
              `Query error [${String(query.queryKey)}]: ${parsed.message}`,
              {
                context: "react-query",
                code: parsed.code,
                requestId: parsed.requestId,
                statusCode: parsed.statusCode,
              },
            );
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            const parsed = parseApiError(error);
            logger.error(`Mutation error: ${parsed.message}`, {
              context: "react-query",
              code: parsed.code,
              requestId: parsed.requestId,
              statusCode: parsed.statusCode,
            });
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: shouldRetry,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
