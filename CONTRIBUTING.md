# Contributing to timeboxd

Thanks for your interest in improving timeboxd. Issues, bug reports, docs fixes, and pull requests are welcome.

## Before you start

- Search existing issues and pull requests to avoid duplicate work.
- For larger features, open an issue first so the direction can be discussed.
- Keep changes focused. Small, reviewable PRs are easier to merge.

## Local setup

Requirements:

- Node 20+
- pnpm

```bash
git clone https://github.com/enzodevs/timeboxd.git
cd timeboxd
pnpm install
cp .env.example .env # optional; only needed for Google sync
pnpm dev
```

The app runs at <http://localhost:3000> by default.

## Useful commands

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Before opening a pull request, run:

```bash
pnpm typecheck && pnpm lint && pnpm test
```

Run `pnpm build` too when your change affects routing, server functions, database code, deployment, or production behavior.

## Project notes

- timeboxd is a TanStack Start app using React, TanStack Router/Query, Tailwind v4, shadcn/ui, Drizzle ORM, and libSQL.
- Server functions live under `src/server/`.
- Keep browser bundles free of server-only database or credential code.
- Database schema changes should include Drizzle migrations when appropriate.
- The app should continue to work without Google Calendar/Tasks configured.

## Pull request checklist

- [ ] The change is focused and explained clearly.
- [ ] Tests, lint, and type-check pass locally where applicable.
- [ ] User-facing behavior is documented or screenshots are included when useful.
- [ ] No secrets, local database files, `.env` values, or generated build artifacts are committed.

## Code of Conduct

By participating, you agree to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).
