# Blog "Premium" Visual Pass

## Context

You asked to make `apps/blog` feel more premium — visual polish, motion/feel, and content-state polish, all at once. Rather than inventing a new visual language from scratch, `apps/web` (the portfolio) already has a fully-built "premium" pattern language: a warm gradient brand identity, ambient blurred-blob glow, glass/frosted-panel surfaces, a hover-lift+shadow treatment for cards, a glow-on-hover treatment for primary CTAs, and a shared `EASE_PREMIUM` cubic-bezier driving scroll-reveal motion (`apps/web/src/lib/motion.ts`, `apps/web/src/components/ambient-gradient.tsx`, and a chunk of `apps/web/src/app/globals.css`). The token *values* (gradient colors, ease curve, radii) already lived in the shared `packages/ui/src/styles/theme.css`, but the *utility classes and components that use them* only existed locally inside `apps/web`, so `apps/blog` inherited none of it — it overrode the shared palette with its own flat, generic violet, and had zero motion beyond what Radix/shadcn give it for free.

You confirmed: keep blog's own violet accent (don't switch to the portfolio's coral gradient), and scope this to `apps/blog` specifically — not a shared redesign. So this **added new reusable pieces to `packages/ui`** (a `motion.ts` lib, an `AmbientGradient` component, a `premium.css` utility file) that `apps/blog` consumes, but **did not touch `apps/web` at all** — its existing local `lib/motion.ts`/`ambient-gradient.tsx`/`globals.css` stayed exactly as they were, untouched and unaware the new shared versions exist. Verified afterward: zero `git status` changes under `apps/web`, and `pnpm --filter web type-check` passes unmodified.

## Foundation — `packages/ui` (new, purely additive)

- `framer-motion` added to `packages/ui/package.json` dependencies.
- `packages/ui/src/lib/motion.ts` (new): `EASE_PREMIUM`, `viewportOnce`, `containerVariants`, `containerVariantsSlow`, `itemVariants`, `itemVariantsX` — copied from `apps/web/src/lib/motion.ts` verbatim. Exported as `@repo/ui/lib/motion`.
- `packages/ui/src/components/ambient-gradient.tsx` (new): `AmbientGradient` copied verbatim from `apps/web/src/components/ambient-gradient.tsx` — blurred, slowly-drifting radial-gradient "blobs" using `var(--gradient-brand-radial)`/`var(--ambient-glow-opacity)`/`var(--ambient-glow-blend)` (theme tokens, not hardcoded), respects `prefers-reduced-motion`. Exported as `@repo/ui/ambient-gradient`.
- `packages/ui/src/styles/premium.css` (new): the hue-agnostic subset of `apps/web/src/app/globals.css`'s hand-authored utilities — `.card-hover` (+`:hover`+`:focus-within`), `.btn-glow:hover`, `.glass`/`.glass-strong` (+ `@supports not (backdrop-filter)` fallback), `.glow-ambient`, `button:focus-visible { transform: scale(1.02); }`. Not porting `.animated-border` or the hero glitch-name system (too bespoke to that one page). Also added `.skeleton-shimmer` (opt-in moving-highlight sweep via `background-position` keyframes, respects `prefers-reduced-motion`) — doesn't touch `packages/ui/src/components/ui/skeleton.tsx`'s default, so every other `<Skeleton>` usage anywhere is unaffected unless the class is explicitly added.

## Blog-local: palette + wiring (`apps/blog/src/app/globals.css`)

Added to both `:root` and `.light`:
- A cool "aurora" `--gradient-brand`/`--gradient-brand-radial` built around blog's existing violet `--primary` (262°) as the 40% anchor stop, flanked by a cyan (0%) and magenta→deep-purple (70%/100%) waypoints — same 4-stop structure as the shared pattern, blog's own hues, defined directly (not routed through separately-named `--magenta`/`--violet` tokens, since blog doesn't use `.animated-border`).
- `--ambient-glow-opacity`/`--ambient-glow-blend` (0.12/screen dark, 0.08/normal light — same values `apps/web` uses).
- `--success`/`--success-foreground`/`--warning`/`--warning-foreground` as genuine semantic status colors, decoupled from the decorative gradient.
- `@import "@repo/ui/styles/premium.css";` added after the theme import.
- `--radius-lg`/`--radius-xl`/`--ease-premium` needed no changes — already inherited from the shared `@theme{}` block.

## Applied across `apps/blog`

- **`site-header.tsx`**: sticky header → `.glass`; "ZY" logo square → `bg-gradient-brand`; "Write" button → `btn-glow`.
- **`components/posts/post-card.tsx`**: `card-hover` on the outer `Card` — covers every place `PostCard` renders (home feed, saved posts, `/u/[username]`, series detail).
- **`app/page.tsx`** (home feed): post grid wrapped in `containerVariants`/`itemVariants` (mount-triggered fade+rise, not scroll-triggered — it's above-the-fold), `<AmbientGradient variant="subtle" />` behind the "Blog" title.
- **`components/posts/post-detail-view.tsx`** + **`components/profile/author-card.tsx`**: sidebar cards (Author, Series, Tags, TOC) → `.glass`.
- **`login/page.tsx` / `signup/page.tsx`**: auth `Card` → `.glass`, submit button → `btn-glow`, logo square → `bg-gradient-brand`.
- **`(protected)/mine/page.tsx`**, **`(protected)/series/mine/page.tsx`**, **`app/series/page.tsx`**: list/grid `Card`s → `card-hover`; each page's one primary action (New series) → `btn-glow`.
- **`(protected)/settings/profile/page.tsx`**: form `Card` → `.glass` (not `card-hover` — it's a static form, not a clickable tile), Save button → `btn-glow`.
- **`components/editor/post-editor.tsx`**: Publish button → `btn-glow`.
- **`(protected)/media/page.tsx`**: `card-hover` added to file tiles only, **not** folder tiles — folder cards are native-HTML5-DnD drop targets with their own conditional `dragOverId`-driven border/background classes, and `.card-hover:hover`'s border-color rule (imported unlayered CSS, which the CSS spec makes take priority over Tailwind's layered `utilities` classes) risked visually overriding the drag-over indicator exactly when a user drags a file over a folder (hover and drag-over are simultaneously true in that interaction) — a real correctness concern for the one page where getting the drop-target affordance right actually matters, so folders were deliberately left as-is.
- **Every remaining `Skeleton` usage app-wide** (post detail, edit page, series detail, `/u/[username]`, settings/blocked, media picker dialog): gained `skeleton-shimmer`.
- **Deliberately left plain** (restraint, matching `apps/web`'s own pattern of not applying hover-lift to every card-shaped thing): `(protected)/notifications/page.tsx` rows (dense vertical list, not a grid — a 4px lift would visually clash with tightly-stacked neighbors; kept the existing `hover:bg-accent` treatment) and `(protected)/settings/blocked/page.tsx` rows (static list items with an inline unblock action, not primarily a navigation target).

## Verification (all done)

- `pnpm --filter @repo/ui type-check`/lint clean after the new files + `framer-motion` dependency.
- `pnpm type-check` — all 10 workspace packages pass, `web` included.
- `pnpm --filter blog exec biome check` — clean except the three pre-existing accepted findings from earlier phases (the `noDangerouslySetInnerHtml` on `post-structured-data.tsx`'s JSON-LD script, and the two `useSemanticElements` findings on the media gallery's drag-source cards) — no new findings introduced.
- `pnpm dev:blog` with a cleared `.next` cache: confirmed via curl + HTML inspection that `.glass`, `bg-gradient-brand`, `.btn-glow`, `.skeleton-shimmer`, and the blog-local `--gradient-brand` (three definitions in the served CSS — theme.css's shared default plus blog's own `:root`/`.light` overrides, confirming the override actually wins in cascade order) all render on the home page and login page; `/series`, `/signup`, and a post detail page all return 200 with no server errors in the dev log.
- `git status --short apps/web/` returns nothing — confirmed zero changes to the portfolio app.
