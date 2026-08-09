# Media Storage Quota (5GB, no billing)

## Context

You asked for the storage quota skynet has (`OrgStorageQuota`: a hard cap tracked per-owner, atomically incremented/decremented as files are uploaded/deleted) — but without any of skynet's purchase/upgrade flow, since that's a multi-tenant SaaS billing feature that doesn't apply here. This is a straight port of skynet's core mechanism, adapted from org-scoped to user-scoped (`media.ownerId` is already how every media table is scoped in this app) and with the purchase button simply omitted.

## Schema (`packages/db/src/schema/blog.ts`, `relations.ts`)

- `userStorageQuota`: `id`, `ownerId` (FK → `user`, cascade, **unique** — one row per user), `totalBytes` (`bigint({mode:"number"})`, default `5368709120` = 5GB — `integer` maxes out at ~2.1GB so this must be `bigint`, unlike `media.size` which stays `integer` since individual files are already capped well under that), `usedBytes` (`bigint({mode:"number"})`, default `0`), `updatedAt`. `relations.ts` gets a matching `userStorageQuotaRelations` (`owner: one(user)`) and `storageQuota: one(userStorageQuota)` added to `userRelations`.

## `packages/trpc/src/public/routers/media-quota.ts` (new)

Mirrors the existing cross-router-helper-export pattern already used in this codebase (`createNotification` from `notification.ts`, `assertNotBlocked` from `block.ts`) — one file exporting both a tiny router and plain helper functions other routers import directly:

- `DEFAULT_QUOTA_BYTES = 5 * 1024 * 1024 * 1024`.
- `ensureQuotaRow(ownerId, executor = db)`: fetch the row; if missing, create it with `usedBytes` **backfilled** from `SELECT coalesce(sum(size), 0) FROM media WHERE owner_id = $1` (not assumed `0`), then `.onConflictDoNothing()` + re-fetch to handle the race of two concurrent first-touches.
- `getQuota(ownerId)`: calls `ensureQuotaRow`, returns `{usedBytes, totalBytes}`.
- `tryReserveQuota(ownerId, bytes, executor = db)`: the atomic guard — `UPDATE user_storage_quota SET used_bytes = used_bytes + bytes WHERE owner_id = $1 AND used_bytes + bytes <= total_bytes RETURNING id`, returns whether a row was affected. Takes an optional `executor` (`db` or a transaction's `tx`, via the same `Tx` alias pattern `post.ts` already uses) so it can participate in the caller's transaction.
- `releaseQuota(ownerId, bytes, executor = db)`: symmetric decrement, `GREATEST(used_bytes - bytes, 0)` floor so drift can never go negative.
- `mediaQuotaRouter`: one procedure, `get: authedProcedure.query(() => getQuota(ctx.session.user.id))`, for the UI usage bar.

Registered as `mediaQuota: mediaQuotaRouter` in `packages/trpc/src/public/routers/_app.ts`.

## Wiring into `media.ts`

- `createPresignedUrl`: after the existing type/size checks, a **soft precheck** — `getQuota(ctx.session.user.id)`, throw `BAD_REQUEST "Storage quota exceeded"` if `usedBytes + input.size > totalBytes`.
- `confirm`: wrapped in `db.transaction()` together with the existing insert — calls `tryReserveQuota(ownerId, input.size, tx)` first; if it returns `false` (lost a race, or the precheck was stale), the insert is skipped and `deleteObject(input.key)` cleans up the orphaned upload before throwing `BAD_REQUEST "Storage quota exceeded"`. If `true`, the insert proceeds in the same transaction.
- `delete`: after the existing `deleteObject` call, `releaseQuota(ownerId, deleted.size)`.
- `bulkDelete`: accumulates the sizes of everything actually deleted in the loop, one `releaseQuota` call with the sum at the end.

## Wiring into `media-folder.ts`

- `delete`: after the existing loop that calls `deleteObject` for every contained file, `releaseQuota(ownerId, sum of containedMedia sizes)` — one call, using the already-fetched `containedMedia` list (now also selecting `size`, not just `{id, storageKey}`).

## Frontend

- **`apps/blog/src/app/(protected)/media/page.tsx`**: a `StorageUsageBar` component rendered right after the title/breadcrumb/toolbar row and before the folder/file grid. Uses `publicApi.mediaQuota.get.useQuery()` and the existing `@repo/ui/progress` `Progress` component, showing "X.X GB of 5 GB used" with the indicator color shifting to amber at 80%+ and destructive at 100% via an arbitrary Tailwind selector on `[data-slot=progress-indicator]`. No purchase button/CTA — explicitly out of scope.
- No new client-side blocking — cumulative quota stays server-enforced; an over-quota upload surfaces through the *existing* per-item upload-error UI in `useMediaUpload`'s `catch` block, which already turns any thrown tRPC error into that item's `error` message.

## Migration

`packages/db/drizzle/0011_funny_triathlon.sql` — new table, two `bigint` columns, one FK, one unique index. Applied to local Docker Postgres via `db:migrate`.

## Verification (completed)

Full flow tested end-to-end against local Postgres + MinIO with a throwaway signed-in account:
- First `mediaQuota.get` call lazily creates the row (`{usedBytes: 0, totalBytes: 5368709120}`).
- Upload → confirm increases `usedBytes` by exactly the file size.
- `media.delete` and `mediaFolder.delete` (multi-file folder) release the correct amount, folder-delete release matching the summed size of all contained files.
- `createPresignedUrl` precheck rejects once a shrunk quota is exceeded.
- Simulated a race at confirm-time (bumped `used_bytes` via direct SQL between presign and confirm) — the atomic guard correctly rejected, `usedBytes` was not double-counted, and the orphaned MinIO object was deleted (404 on re-fetch, no leak).
- `pnpm type-check` and `biome check` clean on all touched files (two pre-existing, already-documented `useSemanticElements` findings on unrelated drag-source cards in the same file are untouched by this change).
