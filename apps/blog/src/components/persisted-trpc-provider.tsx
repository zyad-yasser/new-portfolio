"use client";

import { QUERY_CACHE_MAX_AGE, createQueryPersister } from "@/lib/query-persister";
import { PublicTRPCReactProvider } from "@repo/trpc/public/react";
import { useState } from "react";

export function PersistedTRPCProvider({ children }: { children: React.ReactNode }) {
  const [persister] = useState(() => createQueryPersister());

  return (
    <PublicTRPCReactProvider {...(persister ? { persister, maxAge: QUERY_CACHE_MAX_AGE } : {})}>
      {children}
    </PublicTRPCReactProvider>
  );
}
