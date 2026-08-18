# Firebase Storage emulator for local dev

## Context

`apps/blog`'s local `.env` has `STORAGE_PROVIDER=firebase` with an empty `FIREBASE_SERVICE_ACCOUNT`,
while all 3 existing media rows in the local DB were uploaded back when the app used the S3/MinIO
provider (`localhost:9010`). Result: old images 404 in `next/image` (host not in
`next.config.js`'s `remotePatterns`), and any *new* upload throws immediately (`requireEnv`
crashes on the blank `FIREBASE_SERVICE_ACCOUNT`).

MinIO (already running via `docker-compose.yml`) is the zero-effort fix, but the user wants to
exercise the real Firebase code path locally instead, via the Firebase Local Emulator Suite's
Storage emulator.

**Verified blocker**: the Storage emulator does not support `getSignedUrl({ action: "write" })` —
a known, unimplemented gap in `firebase-tools` open since 2021
([#3400](https://github.com/firebase/firebase-tools/issues/3400),
[#4201](https://github.com/firebase/firebase-tools/issues/4201)). `createPresignedUploadUrl` in
`packages/utils/src/firebase-storage.ts` relies entirely on this for uploads, so the browser's
direct-PUT flow cannot work against the emulator as-is. Per the user's choice, this plan adds a
dev-only server-proxied upload path used only when the emulator is active, so the upload button
keeps working locally without touching the production presigned-URL flow.

Confirmed via docs: the Admin SDK auto-detects `FIREBASE_STORAGE_EMULATOR_HOST` (format:
`host:port`, no protocol) for all non-signing Storage operations (`.save()`, `.delete()`) with no
code needed to read/forward it — and `initializeApp({ projectId })` works with no credential at
all in this mode. Only signing (`getSignedUrl`) truly can't be emulated; everything else can.

## Plan

### 1. Firebase CLI config (repo root, alongside `docker-compose.yml`)

- `firebase.json`: declares `storage.rules` and an `emulators.storage` block (port `9199`) +
  `emulators.ui` (port `4001`).
- `storage.rules`: open dev-only rules (`allow read, write: if true`) — never deployed to
  production, this only governs the local emulator.
- `.firebaserc`: pins `{"projects": {"default": "demo-portfolio"}}` — a `demo-`-prefixed project
  ID puts the Firebase CLI in fully offline mode (no login, no real GCP project needed).
- Root `package.json`: add `firebase-tools` as a devDependency and a new script
  `"firebase:emulators": "firebase emulators:start --only storage"`, sitting next to the existing
  `docker:up`/`docker:down` scripts (kept as a separate Node-CLI-based script rather than folded
  into `docker-compose.yml`, since `firebase-tools` has no official Docker image and running it as
  a plain devDependency is the standard, documented way to use the emulator).

### 2. `packages/utils/src/firebase-storage.ts` — emulator-aware

- Add `isEmulator()` → `!!process.env.FIREBASE_STORAGE_EMULATOR_HOST`.
- `getBucket()`: when `isEmulator()`, call `initializeApp({ projectId: requireEnv("FIREBASE_PROJECT_ID") })`
  instead of the `cert(serviceAccount)` path — no `FIREBASE_SERVICE_ACCOUNT` needed in emulator mode.
- `getPublicUrl(key)`: when `isEmulator()`, return the emulator's REST read URL —
  `` `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/v0/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(key)}?alt=media` ``
  — instead of the real `storage.googleapis.com` URL.
- `createPresignedUploadUrl(...)`: when `isEmulator()`, skip `getSignedUrl` entirely (known
  unsupported) and return `{ uploadUrl: \`/api/media-upload?key=${encodeURIComponent(key)}\`, publicUrl: getPublicUrl(key) }`
  — a same-origin relative path. `use-media-upload.ts`'s `uploadWithProgress` already does a plain
  `xhr.open("PUT", uploadUrl)`, which resolves relative URLs against the current page with zero
  client-side changes needed.
- New export `uploadObjectDirect(key, body: Buffer, contentType: string)` →
  `getBucket().file(key).save(body, { contentType, resumable: false })` — used only by the new
  route below.
- Real (non-emulator) behavior is completely unchanged.

### 3. New dev-only route: `apps/blog/src/app/api/media-upload/route.ts`

Handles the `PUT` that `use-media-upload.ts` already sends to whatever `uploadUrl` the server
returned — no client code changes.

- Returns 404 immediately unless `STORAGE_PROVIDER === "firebase"` and
  `FIREBASE_STORAGE_EMULATOR_HOST` is set (inert/unreachable in production and in MinIO mode).
- Auth: `publicAuth.api.getSession({ headers: request.headers })` (same call
  `packages/trpc/src/public/context.ts` already uses) → 401 if no session, 403 if
  `!session.user.emailVerified` — mirrors `verifiedProcedure`'s gate, the same one
  `media.createPresignedUrl` already sits behind.
- Reads `key` from the query string, rejects (403) unless it starts with
  `media/${session.user.id}/` — same ownership check `media.confirm` already does in
  `packages/trpc/src/public/routers/media.ts:133`.
- Reads the raw request body, passes it straight to `uploadObjectDirect(key, buffer, contentType)`.
- Returns `{ ok: true }`. The existing `media.confirm` tRPC mutation (unchanged) still does the
  real bookkeeping — quota reservation, DB insert, rollback-on-failure — exactly as it does for
  real S3/Firebase today, since it only cares that the object exists at `key`, not how it got there.
- `apps/blog/package.json`: add `@repo/utils` as a direct dependency (this route imports
  `@repo/utils/firebase-storage` directly — per-file resolution convention).

### 4. `apps/blog/next.config.js`

Extend the existing `storageProvider === "firebase"` branch: when `FIREBASE_STORAGE_EMULATOR_HOST`
is set, build `firebaseRemotePattern`/`firebaseConnectOrigins` from
`http://${FIREBASE_STORAGE_EMULATOR_HOST}` instead of `https://storage.googleapis.com`, so
`next/image` and the CSP `img-src` allow the emulator host. (No CSP `connect-src` change needed —
the upload PUT is same-origin now, already covered by `connect-src 'self'`.)

### 5. Env vars

`apps/blog/.env.example` (and the user's own `apps/blog/.env`): add, right after
`FIREBASE_STORAGE_BUCKET`:
```
FIREBASE_STORAGE_EMULATOR_HOST=
FIREBASE_PROJECT_ID=demo-portfolio
```
Document inline that these are optional/local-emulator-only — leave both blank for real
production Firebase, set `FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199` (no protocol) +
`FIREBASE_PROJECT_ID` to use the emulator instead (in which case `FIREBASE_SERVICE_ACCOUNT` isn't
needed at all).

### 6. `CLAUDE.md`

Add a short subsection under "Local infra" documenting: `pnpm firebase:emulators` starts the
Storage emulator + UI (`http://localhost:4001`), the env vars that switch `apps/blog` into
emulator mode, and the one caveat worth remembering — uploads go through a dev-only
server-proxied route (`/api/media-upload`) instead of a real presigned URL, because the emulator
doesn't support signed write URLs; reads/deletes go straight through the Admin SDK unchanged.

## Verification

1. `pnpm add -Dw firebase-tools`, create `firebase.json`/`storage.rules`/`.firebaserc`, add the
   `firebase:emulators` script.
2. Set the new env vars in `apps/blog/.env`; add `@repo/utils` to `apps/blog/package.json`, `pnpm install`.
3. Implement the `firebase-storage.ts`, `next.config.js`, and new route changes.
4. `pnpm firebase:emulators` in one terminal (confirm Storage emulator + UI come up on 9199/4001).
5. `pnpm dev:blog` in another; open the media library, upload an image:
   - confirm the PUT goes to `/api/media-upload` (not a `storage.googleapis.com` URL),
   - confirm the file shows up in the Emulator UI's Storage tab,
   - confirm the uploaded image then renders via `next/image` in the app (proves the
     `next.config.js` remote-pattern change works).
6. Delete that media item from the UI, confirm it disappears from the Emulator UI too (proves
   `deleteObject` still works unchanged against the emulator).
7. `pnpm --filter blog type-check` and `pnpm --filter @repo/utils type-check`.
8. Read-through check: with `FIREBASE_STORAGE_EMULATOR_HOST` unset, confirm every branch added
   above falls back to the exact original (real-GCS) behavior — no regression to the production
   path or to the S3/MinIO provider.
