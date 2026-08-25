import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { del, get, set } from "idb-keyval";

export const QUERY_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

export function createQueryPersister() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return createAsyncStoragePersister({
    key: "blog-query-cache",
    storage: {
      getItem: async (key) => (await get(key)) ?? null,
      setItem: (key, value) => set(key, value),
      removeItem: (key) => del(key),
    },
  });
}
