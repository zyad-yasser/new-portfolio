# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site for Zyad Yasser (zyadyasser.com), built with Next.js App Router. There is no backend/API layer or test suite — this is a static/marketing-style site of landing sections plus a `/projects` page.

## Commands

Package manager is **pnpm** (v10.8.0+, Node >=22). Do not use npm/yarn.

- `pnpm dev` — start the Next.js dev server
- `pnpm build` — production build
- `pnpm start` — run the production build
- `pnpm type-check` — run `tsc` (no emit)
- `pnpm lint` / `pnpm lint:fix` — Biome lint (check / autofix)
- `pnpm format` / `pnpm format:check` — Biome format
- `pnpm check` / `pnpm check:fix` — Biome combined lint+format check/fix (this is what `lint-staged` runs on commit)

There are no test scripts in this repo (`pnpm test` does not exist). Don't assume Jest/Vitest is set up.

Linting/formatting is via **Biome**, not ESLint/Prettier — config lives in `biome.json`. Notable relaxed rules: `noExplicitAny`, `noArrayIndexKey`, `useExhaustiveDependencies`, and `noNonNullAssertion` are all off. Formatter uses double quotes, semicolons, 100-char line width.

There are no commit hooks — run `pnpm check:fix` manually before committing.

## Architecture

Next.js App Router, TypeScript, Tailwind CSS v4 (via `@tailwindcss/postcss`) + Sass (`src/styles` is the Sass include path). Path alias `@/*` maps to `src/*` (see `tsconfig.json`).

- `src/app/` — routes. `layout.tsx` holds all site-wide `<head>` metadata (Open Graph, Twitter cards, robots, JSON-LD via `StructuredData`) and wraps children in `ThemeProvider` (next-themes, class-based dark mode, system default). `page.tsx` is the homepage and is just a composition of section components (`ModernHero`, `ModernAbout`, `ModernServices`, `ModernProjects`, `ModernTestimonials`, `ModernContact`, `ModernFooter`), each wrapped in a labelled `<section>` for a11y. `projects/page.tsx` is the dedicated projects page. `sitemap.ts` statically lists routes for `sitemap.xml`.
- `src/components/` — top-level page sections are named `modern-*.tsx` (e.g. `modern-hero.tsx`, `modern-projects.tsx`) — these are the building blocks composed by `app/page.tsx`. `components/ui/` holds shadcn/ui-style primitives (Button, Card, Input, etc.) built on Radix + `class-variance-authority` (`cva`) + `cn()` from `lib/utils.ts` (clsx + tailwind-merge). `components/seo/structured-data.tsx` emits JSON-LD. `skip-links.tsx` and the section `aria-labelledby` wiring in `app/page.tsx` are part of the accessibility work — preserve this pattern when adding new sections.
- `src/statics/index.ts` — the actual content of the site: `productionProjects`, `otherProjects`, `testimonials`. Edit here to change site copy/data rather than hardcoding it in components. Per-section data that's only used by one component (services list, social links, etc.) is kept local to that component instead — don't move it back into `statics/` unless it's shared.
- `src/models/index.ts` — shared TypeScript interfaces (`Project`, `SubProject`, `Testimonial`) that `statics/index.ts` conforms to.
- `src/constants/index.ts` — `getFirebaseStorageUrl()`, used to build image URLs for the Firebase Storage bucket referenced in `next.config.js`.
- `src/typings/declarations.d.ts` — ambient module declarations.
- `next.config.js` — Sass include path, and permissive `images.remotePatterns` (allows any http/https host plus an explicit Firebase Storage bucket) since project/testimonial images are loaded from external URLs (Firebase Storage) rather than bundled locally.

Deployment is Vercel (`vercel.json`), auto-deploying `master` via `pnpm build`.

## Notes from recent history

- SEO/metadata (`layout.tsx`, `sitemap.ts`, `structured-data.tsx`) and accessibility (skip links, `aria-labelledby` sections) are actively maintained — keep these patterns intact when touching `app/page.tsx` or adding sections.
- The canonical domain is `https://zyadyasser.com`; keep `metadataBase`/OG/canonical URLs in `layout.tsx` in sync with any routing changes.
