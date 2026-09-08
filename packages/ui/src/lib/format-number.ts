const COMPACT_THRESHOLD = 10_000;

const UNITS = [
  { limit: 1_000_000_000_000, suffix: "T" },
  { limit: 1_000_000_000, suffix: "B" },
  { limit: 1_000_000, suffix: "M" },
  { limit: 1_000, suffix: "K" },
] as const;

function trimTrailingZero(value: string) {
  return value.endsWith(".0") ? value.slice(0, -2) : value;
}

export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  const rounded = Math.trunc(value);
  const sign = rounded < 0 ? "-" : "";
  const magnitude = Math.abs(rounded);

  if (magnitude < COMPACT_THRESHOLD) {
    return `${sign}${magnitude.toLocaleString("en-US")}`;
  }

  for (const { limit, suffix } of UNITS) {
    if (magnitude < limit) {
      continue;
    }

    const scaled = magnitude / limit;
    const precision = scaled < 10 ? 1 : 0;
    const truncated = Math.floor(scaled * 10 ** precision) / 10 ** precision;

    return `${sign}${trimTrailingZero(truncated.toFixed(precision))}${suffix}`;
  }

  return `${sign}${magnitude.toLocaleString("en-US")}`;
}

export function formatExactNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return Math.trunc(value).toLocaleString("en-US");
}
