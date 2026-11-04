# Zyad Yasser — Portfolio Monorepo

Source for [zyadyasser.net](https://zyadyasser.net) and its companion apps, built as a Turborepo + pnpm monorepo.

| App | URL | What it is |
| --- | --- | --- |
| `apps/web` | zyadyasser.net | Public portfolio site (plus a contact form API route) |
| `apps/admin` | admin.zyadyasser.net | Private single-owner admin |
| `apps/blog` | blog.zyadyasser.net | Public blog with sign-up, media uploads, social features |
| `apps/reviews` | reviews.zyadyasser.net | Public reviews; shares accounts with the blog |

Shared packages: `@repo/ui` (components + theme), `@repo/auth` / `@repo/auth-ui` (Better Auth instances and auth screens), `@repo/trpc` (API), `@repo/db` (Drizzle + Postgres), `@repo/utils`, `@repo/email`.

## Tech stack

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · Radix/shadcn-style UI · tRPC + React Query · Better Auth · Drizzle + Postgres (Neon in production) · Upstash Redis · Biome · Vitest + Playwright · Vercel.

## Getting started

Requires Node 24 (see `.nvmrc`) and pnpm >= 10.8.

```bash
pnpm install
cp .env.example .env            # docker compose settings
pnpm docker:up                  # Postgres, Redis (+ HTTP proxy), MinIO
# copy each app's .env.example to .env, then:
pnpm db:migrate
pnpm seed
pnpm dev                        # or dev:web / dev:admin / dev:reviews / dev:blog
```

## Common scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | All dev servers (ports 3000–3003) |
| `pnpm build` | Production build of everything |
| `pnpm type-check` | `tsc` across the workspace |
| `pnpm test` | Vitest across the workspace (tRPC integration tests need local Postgres + Redis) |
| `pnpm test:e2e` | Playwright (web, blog) |
| `pnpm check` / `pnpm check:fix` | Biome lint + format |

Architecture, conventions and local infra details live in [CLAUDE.md](CLAUDE.md).
