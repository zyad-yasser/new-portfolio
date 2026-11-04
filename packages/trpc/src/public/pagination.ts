import { type AnyColumn, type SQL, and, eq, gt, lt, or } from "drizzle-orm";
import { z } from "zod";

export const createdAtCursorSchema = z.object({ createdAt: z.coerce.date(), id: z.string() });

export type CreatedAtCursor = z.infer<typeof createdAtCursorSchema>;

export function pageInputSchema(defaultLimit: number, maxLimit: number) {
  return z.object({
    cursor: createdAtCursorSchema.optional(),
    limit: z.number().int().min(1).max(maxLimit).default(defaultLimit),
  });
}

export function afterCursor(
  columns: { createdAt: AnyColumn; id: AnyColumn },
  cursor: CreatedAtCursor | undefined,
  direction: "asc" | "desc" = "desc"
): SQL | undefined {
  if (!cursor) {
    return undefined;
  }

  const beyond = direction === "desc" ? lt : gt;
  return or(
    beyond(columns.createdAt, cursor.createdAt),
    and(eq(columns.createdAt, cursor.createdAt), beyond(columns.id, cursor.id))
  );
}

export function toPage<T>(
  rows: T[],
  limit: number,
  cursorOf: (row: T) => CreatedAtCursor
): { items: T[]; nextCursor: CreatedAtCursor | null } {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items.at(-1);

  return { items, nextCursor: hasMore && last ? cursorOf(last) : null };
}

export function byOwnCursor(row: { createdAt: Date; id: string }): CreatedAtCursor {
  return { createdAt: row.createdAt, id: row.id };
}
