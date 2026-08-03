# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Turborepo/pnpm monorepo for Zyad Yasser's portfolio (zyadyasser.net):

- `apps/web` — the public portfolio site. Static/marketing-style Next.js App Router site of landing sections plus a `/projects` page. No backend of its own.
- `apps/admin` — a private, authenticated admin app (deploys separately to `admin.zyadyasser.net`). Currently auth scaffolding only (login + a protected dashboard shell) — no content-management features yet.
- `packages/ui` — shared shadcn/ui-style component primitives, `cn()`, theme provider/toggle, and the shared Tailwind v4 theme tokens (`@repo/ui`). Both apps depend on this rather than keeping their own copies.
- `packages/db` — the Drizzle/Postgres (Neon) layer (`@repo/db`): db client + schema, meant to be consumed by any package/app that needs direct DB access, not just auth.
- `packages/auth` — shared Better Auth setup (`@repo/auth`): the `auth` server instance and `authClient`, built on `@repo/db`. Only `apps/admin` uses this today.
- `packages/trpc` — the API layer (`@repo/trpc`). All backend APIs go through tRPC procedures here, not ad-hoc Next.js route handlers — an app only needs a thin `fetchRequestHandler` route file to mount it.

## Commands

Package manager is **pnpm** (v10.8.0+, Node >=22) with Turborepo. Do not use npm/yarn.

Run from the repo root unless noted:

- `pnpm dev` — start all apps' dev servers via Turborepo; `pnpm dev:web` / `pnpm dev:admin` to run just one
- `pnpm build` — production build of everything (Turborepo, respects the dependency graph)
- `pnpm type-check` — `tsc` across all packages/apps
- `pnpm lint` / `pnpm lint:fix` — Biome lint (check / autofix), workspace-wide
- `pnpm format` / `pnpm format:check` — Biome format, workspace-wide
- `pnpm check` / `pnpm check:fix` — Biome combined lint+format check/fix

Or scope to one workspace: `pnpm --filter web <script>`, `pnpm --filter admin <script>`, `pnpm --filter @repo/auth <script>`.

- `pnpm test` — Vitest (`vitest run`) across every package/app that has it (`apps/web`, `apps/admin`); `pnpm --filter web test:watch` / `pnpm --filter admin test:watch` for watch mode
- `pnpm test:e2e` — Playwright, `apps/web` only (`pnpm --filter web test:e2e:ui` for the UI runner). Starts `pnpm dev` automatically via `webServer` in `playwright.config.ts` (reuses an already-running dev server) — CI should build first and point `webServer.command` at `pnpm start` instead for a prod-accurate run.

Vitest config per app is `vitest.config.mts` (jsdom environment, `@testing-library/react` + `@testing-library/jest-dom/vitest` wired via `vitest.setup.ts`, native `resolve.tsconfigPaths` for the `@/*` alias). Test files are colocated next to source as `*.test.ts(x)`; Playwright specs live in `apps/web/e2e/*.spec.ts` and are explicitly excluded from Vitest's discovery.

Linting/formatting is via **Biome**, not ESLint/Prettier — a single root `biome.json` covers the whole workspace. Notable relaxed rules: `noExplicitAny`, `noArrayIndexKey`, `useExhaustiveDependencies`, and `noNonNullAssertion` are all off. Formatter uses double quotes, semicolons, 100-char line width.

There are no commit hooks — run `pnpm check:fix` manually before committing.

### Local infra (Postgres + MinIO)

`docker-compose.yml` at the repo root runs local Postgres and MinIO (S3-compatible object storage) for dev:

- `pnpm docker:up` / `pnpm docker:down` — start/stop the stack. A one-shot `minio-createbucket` container auto-creates the `portfolio-uploads` bucket (public-read) on startup and exits — seeing it as "exited (0)" in `docker compose ps` is expected, not a failure.
- Copy `.env.example` → `.env` at repo root to customize compose credentials/ports (docker compose reads `.env` from the compose file's directory automatically).
- **`apps/admin/.env` is the only app/package `.env` in the repo** — copy `apps/admin/.env.example` → `apps/admin/.env` and that's it. `packages/db`, `packages/auth`, and `packages/trpc` have no `.env` of their own; they just read `process.env` (populated by whichever app is running, e.g. Next.js auto-loading `apps/admin/.env`). Their standalone CLI commands (`drizzle-kit`, the seed script) explicitly load `apps/admin/.env` via `dotenv-cli` (`dotenv -e ../../apps/admin/.env -- <command>`, see `packages/db/package.json`) since there's no Next.js process to auto-load it for them.
- Bootstrap: `pnpm docker:up`, then `pnpm db:push` (Drizzle push against local Postgres), then `pnpm seed` (creates the admin account from `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `apps/admin/.env`, idempotent — safe to rerun).
- `@repo/db` uses `postgres` (postgres.js) + `drizzle-orm/postgres-js`, not Neon's HTTP driver — this is deliberate so the same `DATABASE_URL` works against local Docker Postgres and Neon in production without any driver branching (Neon is wire-compatible with standard Postgres clients).
- Any script that opens a `@repo/db` connection and is meant to run once and exit (like `packages/db/scripts/seed.ts`) must call `process.exit()` when done — postgres.js keeps its connection open, which otherwise hangs the process forever even after the script's actual work has finished.

## Architecture

Turborepo (`turbo.json`) + pnpm workspaces (`pnpm-workspace.yaml`: `apps/*`, `packages/*`). Shared strict TypeScript config lives in root `tsconfig.base.json`; each app/package extends it and sets its own `baseUrl`/path aliases.

### `apps/web`

Next.js App Router, Tailwind CSS v4 (via `@tailwindcss/postcss`). Path alias `@/*` maps to `apps/web/src/*`.

- `src/app/` — routes. `layout.tsx` holds all site-wide `<head>` metadata (Open Graph, Twitter cards, robots, JSON-LD via `StructuredData`) and wraps children in `ThemeProvider` (from `@repo/ui`). `page.tsx` is the homepage, a composition of section components (`ModernHero`, `ModernAbout`, `ModernServices`, `ModernProjects`, `ModernTestimonials`, `ModernContact`, `ModernFooter`), each wrapped in a labelled `<section>` for a11y. `projects/page.tsx` is the dedicated projects page. `sitemap.ts` statically lists routes for `sitemap.xml`.
- `src/components/` — top-level page sections are named `modern-*.tsx` — the building blocks composed by `app/page.tsx`. Shared primitives (Button, Card, Input, etc.) now live in `@repo/ui`, not locally. `components/seo/structured-data.tsx` emits JSON-LD. `skip-links.tsx` and the section `aria-labelledby` wiring in `app/page.tsx` are part of the accessibility work — preserve this pattern when adding new sections.
- `src/statics/index.ts` — the actual content of the site: `productionProjects`, `otherProjects`, `testimonials`. Edit here to change site copy/data rather than hardcoding it in components. Per-section data that's only used by one component (services list, social links, etc.) is kept local to that component instead — don't move it back into `statics/` unless it's shared.
- `src/models/index.ts` — shared TypeScript interfaces (`Project`, `SubProject`, `Testimonial`) that `statics/index.ts` conforms to.
- `src/constants/index.ts` — `getFirebaseStorageUrl()`, used to build image URLs for the Firebase Storage bucket referenced in `next.config.js`.
- `next.config.js` — permissive `images.remotePatterns` (allows any http/https host plus an explicit Firebase Storage bucket) since project/testimonial images are loaded externally, plus the site's CSP/security headers.

Deployment is its own Vercel project (`apps/web/vercel.json`, Root Directory `apps/web`), auto-deploying `master`.

Testing: Vitest (`vitest.config.mts`) for unit/component tests, Playwright (`playwright.config.ts`, `e2e/`) for browser e2e — this is the only app with Playwright configured.

### `apps/admin`

Next.js App Router, same Tailwind v4 + `@repo/ui` setup. Path alias `@/*` maps to `apps/admin/src/*`. Single-owner admin — there is no public sign-up; one admin account is created via `pnpm --filter admin seed` (delegates to `@repo/db`'s seed script; `pnpm --filter admin db:push` likewise delegates to `@repo/db`). This is also the app whose `.env` everything else's local dev reads from — see "Local infra" above.

- `src/app/api/auth/[...all]/route.ts` — Better Auth's Next.js route handler, backed by `@repo/auth`.
- `src/app/api/trpc/[trpc]/route.ts` — mounts `@repo/trpc`'s `appRouter` via `fetchRequestHandler`. Any new API belongs in `packages/trpc/src/routers`, not as a new route handler here.
- `src/proxy.ts` — Next 16's renamed `middleware.ts` convention (exports `proxy`, not `middleware`). Optimistic session-cookie redirect to `/login` for unauthenticated page requests (cheap cookie check, no DB hit). Its matcher excludes `/api/*` — API/tRPC routes enforce auth themselves via context and return a proper 401, not an HTML redirect.
- `src/app/login/page.tsx` — email+password sign-in, calls `authClient.signIn.email()`.
- `src/app/(dashboard)/layout.tsx` — the authoritative auth check (`auth.api.getSession()`, redirects if absent) plus the sidebar/topbar shell.
- Root layout wraps children in `@repo/trpc/react`'s `TRPCReactProvider` (React Query + tRPC client) inside `@repo/ui`'s `ThemeProvider`.
- Metadata sets `robots: { index: false, follow: false }` — this app should never be indexed.

Deployment is a separate Vercel project pointed at `admin.zyadyasser.net` (Root Directory `apps/admin`).

Testing: Vitest (`vitest.config.mts`) for unit/component tests. No Playwright here yet.

### `packages/ui` (`@repo/ui`)

shadcn/ui-style primitives built on Radix + `class-variance-authority` (`cva`) + `cn()` (clsx + tailwind-merge), plus `ThemeProvider`/`ThemeToggle` (next-themes) and the shared Tailwind v4 theme tokens (`src/styles/theme.css` — the brand palette, imported by both apps' `globals.css`). Has its own `components.json` so `pnpm dlx shadcn@latest add <component>` can be run directly inside this package to add more primitives.

### `packages/db` (`@repo/db`)

Postgres (local Docker or Neon in production) + Drizzle, meant to be shared by anything that needs the DB — not owned by auth:
- `src/schema/auth.ts` — Better Auth's required tables (`user`, `session`, `account`, `verification`); `src/schema/index.ts` re-exports it as the schema barrel — add new domain tables as sibling files here
- `src/index.ts` — the Drizzle client (`drizzle-orm/postgres-js`), reads `DATABASE_URL`
- `drizzle.config.ts` / `pnpm --filter @repo/db db:push` (or `db:generate`) — schema migrations, loads `apps/admin/.env` via `dotenv-cli`
- `scripts/seed.ts` (`pnpm --filter @repo/db seed`) — creates the single admin account from `ADMIN_NAME`/`ADMIN_EMAIL`/`ADMIN_PASSWORD` in `apps/admin/.env`; this is the only way a user gets created, there is no public registration route. Inserts the `user`/`account` rows directly (hashing the password with `hashPassword` from `better-auth/crypto`) instead of calling `@repo/auth`'s `auth.api.signUpEmail` — `@repo/db` intentionally does not depend on `@repo/auth`, since `@repo/auth` already depends on `@repo/db` and a package.json cycle between them would make Turborepo reject the whole workspace graph. The inserted shape (`providerId: "credential"`, `accountId` set to the user's own `id`) mirrors better-auth's internal `sign-up` route exactly — verified by actually logging in against a seeded account.

### `packages/auth` (`@repo/auth`)

Better Auth (email+password only, no social providers), built on `@repo/db`:
- `src/index.ts` — the `auth` server instance (`drizzleAdapter` over `@repo/db`)
- `src/client.ts` — `authClient` for use in client components

### `packages/trpc` (`@repo/trpc`)

Initial tRPC v11 setup — the intended home for all backend API logic:
- `src/init.ts` — `initTRPC` instance (superjson transformer), `createTRPCRouter`, `publicProcedure`, `protectedProcedure` (throws `TRPCError({code: "UNAUTHORIZED"})` if no session)
- `src/context.ts` — `createTRPCContext()` pulls the Better Auth session from request headers via `@repo/auth`
- `src/routers/_app.ts` — the root `appRouter`; add new routers here and merge them in
- `src/provider.tsx` — exports `api` (`createTRPCReact`) and `TRPCReactProvider` (React Query + tRPC client, points at `/api/trpc`) for client components. Note: this file is intentionally not named `react.tsx` — with `baseUrl: "./src"` in this package's tsconfig, a file named `react.tsx` shadows the bare `"react"` import for every file in the package (TS resolves the bare specifier against baseUrl first). Exported publicly as `@repo/trpc/react` regardless.
- Consuming app just needs a thin route handler using `fetchRequestHandler` (see `apps/admin/src/app/api/trpc/[trpc]/route.ts`) plus `@repo/trpc` as a dependency; `@trpc/server` must also be a *direct* dependency of that app since the route file itself imports it (per-file node_modules resolution in this workspace).

## Git rules for Claude Code

- Never run `git commit` in this repo unless explicitly asked to commit in that specific message.
- Never open, create, or push a pull request unless explicitly asked to in that specific message.
- Leaving changes uncommitted/unstaged after finishing a task is the expected default — the user commits manually.

## Notes from recent history

- SEO/metadata (`layout.tsx`, `sitemap.ts`, `structured-data.tsx`) and accessibility (skip links, `aria-labelledby` sections) are actively maintained in `apps/web` — keep these patterns intact when touching `app/page.tsx` or adding sections.
- The canonical domain is `https://zyadyasser.net` (admin: `https://admin.zyadyasser.net`); keep `metadataBase`/OG/canonical URLs in `apps/web/src/app/layout.tsx` in sync with any routing changes.
- The repo was converted from a single Next.js app at the repo root into this Turborepo monorepo to support the admin app and shared auth — `apps/web`'s behavior/content is unchanged by that move, only its location and how it consumes shared UI.
