"use client";

import { PublicTRPCReactProvider } from "@repo/trpc/public/react";
import { useState } from "react";
import { createQueryPersister, QUERY_CACHE_MAX_AGE } from "@/lib/query-persister";

export function PersistedTRPCProvider({ children }: { children: React.ReactNode }) {
  const [persister] = useState(() => createQueryPersister());

  return (
    <PublicTRPCReactProvider {...(persister ? { persister, maxAge: QUERY_CACHE_MAX_AGE } : {})}>
      {children}
    </PublicTRPCReactProvider>
  );
}
