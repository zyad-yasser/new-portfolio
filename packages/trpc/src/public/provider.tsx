"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type Persister, PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";
import type { PublicAppRouter } from "./routers/_app";

export const publicApi = createTRPCReact<PublicAppRouter>();

const FIVE_MINUTES = 5 * 60 * 1000;
const THIRTY_SECONDS = 30 * 1000;

export function PublicTRPCReactProvider({
  children,
  persister,
  maxAge,
}: {
  children: React.ReactNode;
  /** Opt-in: when provided, the query cache survives a hard refresh via this persister. */
  persister?: Persister;
  /** Discards persisted data older than this (ms) instead of treating it as fresh. */
  maxAge?: number;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: THIRTY_SECONDS,
            gcTime: FIVE_MINUTES,
            retry: 1,
          },
        },
      })
  );
  const [trpcClient] = useState(() =>
    publicApi.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <publicApi.Provider client={trpcClient} queryClient={queryClient}>
      {persister ? (
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister, ...(maxAge !== undefined ? { maxAge } : {}) }}
        >
          {children}
        </PersistQueryClientProvider>
      ) : (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )}
    </publicApi.Provider>
  );
}
