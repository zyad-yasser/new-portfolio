# Inline Video Support (+ generalizing the media pipeline)

## Context

`apps/blog` already supported inline **images** end-to-end: Tiptap's `Image` extension was enabled (`apps/blog/src/components/editor/extensions.ts`), the editor's "Insert image" toolbar button opened `MediaPickerDialog`, and the whole upload pipeline (presigned PUT → confirm → `media` table row) was already type-agnostic at the storage layer. What was missing for video: (1) the media router only allow-listed image MIME types and capped every upload at 8MB, (2) there was no Tiptap node for video, (3) every place that rendered a media thumbnail (`MediaPickerDialog`, the full `/media` gallery, `MediaPreviewDialog`) assumed `next/image` could render the `url`, which breaks for a video file, and (4) the S3/Firebase presigned PUT URL expired in 60s — fine for an 8MB photo, not for a 100MB+ clip on a normal home upload connection.

This extended the existing media system to be video-aware rather than building a parallel one, reusing `MediaPickerDialog`/`useMediaUpload`/the `media` tRPC router/`@repo/utils/storage` as-is wherever possible.

## Backend

- **`packages/utils/src/s3.ts`** and **`firebase-storage.ts`**: `createPresignedUploadUrl` gained an optional `expiresInSeconds` param (default 60, unchanged for images), passed through to `getSignedUrl` (S3) / computed into `expires: Date.now() + expiresInSeconds * 1000` (Firebase). `packages/utils/src/storage.ts`'s wrapper passes it through.
- **`packages/trpc/src/public/routers/media.ts`**:
  - `ALLOWED_IMAGE_TYPES` → `ALLOWED_MEDIA_TYPES`, gained `video/mp4: "mp4"`, `video/webm: "webm"`, `video/quicktime: "mov"` alongside the existing image entries.
  - Two size ceilings instead of one: `MAX_IMAGE_BYTES = 8MB` (unchanged), `MAX_VIDEO_BYTES = 200MB`. `createPresignedUrl`'s input validation is a zod `.refine()` (rather than a single `.max()`) that picks the ceiling based on whether `contentType` starts with `video/`.
  - `createPresignedUrl` passes `expiresInSeconds: 1200` (20 min) for video uploads, omitted (default 60) for images.
  - `confirm` input/logic unchanged — `width`/`height` stay optional, populated for video too via client-side `videoWidth`/`videoHeight` capture.

## Frontend — the video node

- **`apps/blog/src/components/editor/video-extension.ts`** (new): a minimal custom Tiptap `Node` (Tiptap has no official video node) — `group: "block"`, `atom: true`, `draggable: true`, one `src` attribute, `parseHTML`/`renderHTML` mapping to a plain `<video controls preload="metadata">` tag, plus a `setVideo({ src })` command mirroring `Image`'s `setImage`. Required adding `@tiptap/core` as a *direct* dependency of `apps/blog` (it wasn't one — only re-exported indirectly through `@tiptap/react`/`@tiptap/starter-kit` — and this monorepo's per-file node_modules resolution needs any package a file imports directly to be a direct dependency). Registered in `createExtensions()` (`extensions.ts`) alongside `Image` — since `tiptap-content.tsx` (the read-only renderer for published posts) already calls `createExtensions()`, published posts get video playback with no separate renderer needed.

## Frontend — wiring

- **`apps/blog/src/components/editor/tiptap-editor.tsx`**: "Insert image" toolbar button/state renamed to "Insert media"; `onSelect` branches on `item.mimeType.startsWith("video/")` → `setVideo({ src })`, else the existing `setImage` call.
- **`apps/blog/src/components/media/use-media-upload.ts`**: `MediaItem` type gained `mimeType`. `captureImageDimensions` → `captureMediaDimensions`, branching on `file.type` — video files get a `document.createElement("video")` + `loadedmetadata` listener reading `videoWidth`/`videoHeight`. Added a client-side `validateFile()` guard (mirroring the server's allow-list/ceilings) at the top of `upload()` so oversized/unsupported files fail fast with a friendly per-item error before any network call.
- **`MediaPickerDialog`**: gained a `mediaKind?: "image" | "all"` prop (default `"all"`) — when `"image"`, `mediaList` is filtered client-side to non-video items. `IMAGE_ACCEPT`/`ALL_ACCEPT` and `MAX_IMAGE_BYTES`/`MAX_VIDEO_BYTES` swap based on `mediaKind`. Grid tiles: video items render a muted, controls-less `<video>` (shows the first frame automatically) with a centered `Play` icon badge, instead of `next/image`.
- **`cover-image-picker.tsx`**: passes `mediaKind="image"` on both `MediaPickerDialog` usages — cover images stay images-only.
- **`(protected)/media/page.tsx`** (full gallery): `ACCEPT` widened to include the three video mimetypes, `MAX_SIZE_BYTES` raised to the 200MB video ceiling, same video-tile treatment (muted `<video>` + play badge) as the picker dialog on file tiles. Folder tiles untouched.
- **`media-preview-dialog.tsx`**: renders `<video controls src={item.url}>` instead of `next/image` when `item.mimeType.startsWith("video/")`; the metadata `<dl>`/Download button stay as-is (already generic).

## Verification (all done)

- `pnpm type-check` — all 10 workspace packages pass. `biome check` clean across `@repo/utils`/`@repo/trpc`/`@repo/ui`/`@repo/db`/`blog` except pre-existing accepted findings (the `label.tsx` one from before this project, `noDangerouslySetInnerHtml` on the JSON-LD script, the two `useSemanticElements` findings on the media gallery's drag-source cards) plus one new *same-category* finding: `useMediaCaption` on the preview dialog's `<video controls>` — left unaddressed like the others, since there's no caption track to provide for arbitrary user-uploaded video.
- `pnpm dev:blog`, exercised end-to-end via real tRPC calls with a throwaway signed-in account: requested a presigned URL for `video/mp4` and confirmed `X-Amz-Expires=1200` in the returned URL (vs. images' 60s); confirmed a 250MB video request is rejected ("File is too large") while a 100MB one succeeds, an oversized *image* (10MB) is separately rejected against its own 8MB ceiling, and an unsupported content type (`application/pdf`) is rejected; uploaded a real file to MinIO and called `confirm` with `width`/`height`, then `media.list` returned it correctly; created and published a post whose `contentJson` embeds a `{type: "video", attrs: {src}}` node — round-tripped through Postgres `jsonb` correctly; the post page, `/media` gallery, and `/new` editor page all rendered 200 with no server-side errors in the dev log.
