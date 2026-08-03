# Zyad Yasser — Portfolio

Personal portfolio site for Zyad Yasser, built with Next.js. Live at [zyadyasser.net](https://zyadyasser.net).

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router) + [React](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) v4 + Sass
- [Radix UI](https://www.radix-ui.com/) primitives with `class-variance-authority` (shadcn/ui-style components)
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Biome](https://biomejs.dev/) for linting and formatting
- Deployed on [Vercel](https://vercel.com/)

## Getting Started

Requires Node >=22 and [pnpm](https://pnpm.io/) >=10.8.0.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm type-check` | Type-check with `tsc` |
| `pnpm lint` / `pnpm lint:fix` | Lint (check / autofix) |
| `pnpm format` / `pnpm format:check` | Format (write / check) |
| `pnpm check` / `pnpm check:fix` | Combined lint + format (check / autofix) |
| `pnpm clean` | Remove build artifacts and dependency caches |

## Project Structure

```
src/
  app/          # Routes (App Router): layout, homepage, /projects, sitemap
  components/   # Page sections (modern-*.tsx) and shared UI primitives (ui/)
  statics/      # Site content/data (projects, testimonials)
  models/       # Shared TypeScript interfaces for the static content
  constants/    # Firebase Storage URL helper
  lib/          # Tailwind classname helper (cn)
  typings/      # Ambient type declarations
```

## Contributing

Run `pnpm check:fix` before committing to lint and format your changes.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for more information.

---

Made with ♥ by Zyad Yasser
