const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function isLocalDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return false;
  }

  try {
    return LOCAL_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function listItems<T>(result: T[] | { items: T[] }) {
  return Array.isArray(result) ? result : result.items;
}
