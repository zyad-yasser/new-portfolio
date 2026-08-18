# Expand seed script: verification split + social-graph sample data

## Context

Seed data (`packages/db/scripts/seed.ts`) currently creates `seed.writer@example.com` and
`seed.reviewer@example.com` both with `emailVerified: false`. Most blog actions (write, comment,
react, follow, upload media, reshare) are gated behind `verifiedProcedure`, so testing anything
locally with these accounts meant manually flipping `email_verified` in the DB — which is exactly
what happened earlier this session to test the Firebase emulator upload flow. Separately, the
user hit `Invalid src prop ... hostname "localhost" is not configured` on a post's cover image —
traced to a `media`/`post` row created by an unrelated, manually-created "Media Tester" account
during earlier feature testing, pointing at a now-stale MinIO URL. Neither issue is something a
fresh `pnpm seed` run currently fixes.

Goal: one verified / one unverified seed account (so both the "can do X" and "can't do X yet,
verify your email" UI paths are exercisable out of the box), plus real sample social-graph data
(follow, a real working media post, a reshare, a quote) so the newer features have something to
look at immediately after seeding — and clean up the one broken leftover post so the reported
error stops appearing.

## Plan

### 1. Verification split

In `seedTestUsers()` (`packages/db/scripts/seed.ts`), set `emailVerified: true` for
`seed.writer@example.com` and keep `emailVerified: false` for `seed.reviewer@example.com`, both
on first creation and on reset (currently the reset branch only touches the password — extend it
to also reset `emailVerified` to the intended value, so reseeding is idempotent even if a value
got changed via manual testing, same as the password-reset behavior already there).

### 2. Storage: add a direct (non-presigned) upload, dispatched like the rest of `@repo/utils/storage`

- `packages/utils/src/s3.ts`: add `uploadObjectDirect(key, body: Buffer, contentType: string)` —
  a plain `PutObjectCommand` with `Body: body` (mirrors the existing `deleteObject`'s
  `DeleteObjectCommand` pattern in the same file). MinIO/S3 has no signed-URL limitation, so this
  is a trivial addition.
- `packages/utils/src/firebase-storage.ts` already has this exact function (added for the
  emulator work) — no change needed there.
- `packages/utils/src/storage.ts`: proxy `uploadObjectDirect` through `getProvider()` alongside
  the existing `getPublicUrl`/`createPresignedUploadUrl`/`deleteObject`, so seed.ts (and anything
  else later) can call one provider-agnostic function regardless of S3 vs Firebase (real or
  emulator).

### 3. `packages/db` needs to reach storage config + the upload function

- `packages/db/package.json`: add `@repo/utils` as a dependency (no cycle — `@repo/utils` has no
  dependency back on `@repo/db`, unlike `@repo/auth`).
- `packages/db/package.json`'s `seed` script: chain-load `apps/blog/.env` in addition to
  `apps/admin/.env` — `dotenv -e ../../apps/admin/.env -e ../../apps/blog/.env -- tsx scripts/seed.ts`.
  `apps/admin/.env` has zero storage config (`STORAGE_PROVIDER`/`S3_*`/`FIREBASE_*` are all
  absent — confirmed), so without this the seed script's storage calls would immediately throw
  `Missing required environment variable`. `dotenv-cli` processes `-e` flags in order and only
  sets a var if not already set by an earlier file — admin's `.env` wins on any overlapping key
  (there are none relevant here), blog's fills the storage gap. This makes the seed script use
  whatever storage backend `apps/blog/.env` is actually configured for right now (S3/MinIO, real
  Firebase, or the Firebase emulator) — matching the real app instead of hardcoding one.
- Wrap the upload call in try/catch in seed.ts: if storage env vars are still missing (e.g. fresh
  clone, `apps/blog/.env` not copied from `.env.example` yet), log
  `"Skipping sample media post: storage isn't configured"` and skip only the media/quote steps —
  everything else (users, articles, follow, plain reshare) still seeds successfully.

### 4. New seed content in `packages/db/scripts/seed.ts`

All new steps run only inside the existing `isLocalDatabase` block (same guard as
`seedTestUsers`), after `seedTestUsers()`, and each checks for existing rows first (same
idempotent pattern as `seedCategories`/`seedBlogPosts`) so reruns don't duplicate data:

- **Follow**: `seed.writer` follows `seed.reviewer` — insert into `userFollow`
  (`followerId`/`followingId`, composite PK already prevents duplicates — check-then-insert like
  the rest of the file) plus a matching `notification` row (`type: "follow"`,
  `recipientId: reviewerId`, `actorId: writerId`).
- **Media + media post** (skipped if storage isn't configured, per above):
  - A tiny embedded PNG (a few dozen bytes, inlined as a base64 literal in seed.ts — no network
    dependency, no image library needed) uploaded via `uploadObjectDirect` from
    `@repo/utils/storage` to a fixed key (e.g. `media/${writerId}/seed-sample-cover.png` — fixed,
    not a random UUID, so reseeding overwrites in place instead of piling up duplicates).
  - `media` row: `ownerId: writerId`, matching `storageKey`/`url` (from `getPublicUrl`),
    `originalName: "seed-sample-cover.png"`, `mimeType: "image/png"`, real byte `size`. No
    `userStorageQuota` row needs to be created manually — `ensureQuotaRow` in
    `packages/trpc/src/public/routers/media-quota.ts` lazily sums existing `media` rows the first
    time quota is read, so it self-corrects.
  - `post` row: `type: "media"`, `authorId: writerId`, `title: null`, a short caption in both
    `excerptText` and `contentJson` (paragraph node) plus an inline `{ type: "image", attrs: {
    src: publicUrl, alt } }` node — same shape `apps/blog/src/components/composer/media-post-dialog.tsx:20`
    already builds for real media posts. `published: true`, slug via the existing `uniqueSlug()`
    helper (already in the file) derived from the caption text.
- **Reshare**: `seed.reviewer` reshares the existing "Welcome to the Blog" article (published,
  authored by `seed.writer` — satisfies `reshareRouter.create`'s "can't reshare your own post"
  and "must be published" invariants). Insert into `postReshare`
  (`userId: reviewerId`, `postId`) plus a `notification` row (`type: "reshare"`,
  `recipientId: writerId`, `actorId: reviewerId`, `postId`).
- **Quote**: `seed.reviewer` quote-reshares the new media post with a short opinion caption — a
  new `post` row (`type: "quote"`, `quotedPostId: <media post id>`, `authorId: reviewerId`,
  `title: null`, its own `contentJson`/`excerptText`/slug, `published: true`) plus a
  `notification` row (`type: "quote"`, `recipientId: writerId`, `actorId: reviewerId`,
  `postId: <new quote post id>`) — mirrors `postRouter.createQuote`'s notification shape exactly
  (points at the new quote post, not the original).

(Seed data bypasses tRPC entirely and inserts straight into the DB — same as the existing
seeded articles already do with `published: true` — so `verifiedProcedure`'s gate on the actor
doesn't apply here; this just fabricates a plausible end state, same philosophy as the rest of
the script.)

### 5. Clean up the pre-existing broken test data

One-time manual cleanup (not part of the idempotent seed script, since this isn't seed-owned
data): delete the "Media Library Test Post" row (`post.id = 'be62071e-f415-49e6-9673-c9d53361493b'`)
and the 3 orphaned `media` rows owned by the "Media Tester" account
(`owner_id = '7lbldRPTdFdSL6Gw67jPaGHKKSCnaaaB'`), all pointing at the stale `localhost:9010`
MinIO URL. Done directly via `docker exec portfolio-postgres-1 psql`, not a code change.

## Verification

1. `pnpm install` (after the `@repo/db` → `@repo/utils` dependency + `s3.ts` change).
2. `pnpm --filter @repo/utils type-check` and `pnpm --filter @repo/db type-check`.
3. Run the one-time cleanup DELETEs for the broken post/media rows.
4. `pnpm seed` — confirm it logs creation of the follow, media post, reshare, and quote (or the
   graceful skip message if storage isn't configured), and re-run it a second time to confirm
   full idempotency (no duplicate-key errors, no duplicated rows).
5. Query the DB directly to confirm: `seed.writer` has `email_verified = true`,
   `seed.reviewer` has `email_verified = false`, the new `userFollow`/`postReshare`/`post`
   (media + quote)/`media`/`notification` rows exist and reference the right users.
6. In the browser (`pnpm dev:blog`), log in as `seed.writer@example.com` /
   `SeedUser-Pass123!`, confirm the media post's cover image actually renders (proves the
   real upload + `next/image` remote pattern both work end-to-end), and confirm the old broken
   post is gone from the homepage/feed.
7. `pnpm type-check` (full monorepo) and `pnpm check` — confirm no regressions.
