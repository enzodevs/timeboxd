# AGENTS.md — timeboxd

Guidance for AI coding agents working in this repo.

## Project at a glance

timeboxd is a **TanStack Start** app (full-stack React on Router + Vite + Nitro).
Stack: React 19, TanStack Start + Router + Query, Drizzle ORM + libSQL, Tailwind v4 +
shadcn, dnd-kit, tiptap, Google OAuth. The server layer (BFF) lives in `src/server/*.ts`
as `createServerFn` RPCs; the OAuth callback is an API route under `src/routes/`.

## TanStack skills (via opensrc — NOT installed as plugins)

We do **not** install the TanStack Claude Code plugins. Instead, the full
[`tanstack-skills`](https://github.com/tanstack-skills/tanstack-skills) repo is available
through **opensrc** (a local source cache). Each skill is a single `SKILL.md` with API
reference, examples, TypeScript patterns, best practices, and common pitfalls.

**How to read a skill** — resolve the cache path (auto-fetches on a cache miss), then read
the relevant `SKILL.md`:

```bash
opensrc path tanstack-skills/tanstack-skills
# → <BASE>, e.g. ~/.opensrc/repos/github.com/tanstack-skills/tanstack-skills/main
```

Skill files live at:

```
<BASE>/plugins/<skill>/skills/<skill>/SKILL.md
```

**When to read one:** before writing or changing code that touches a TanStack library —
especially Start (server functions, middleware, SSR), Router, or Query. Read the skill
first instead of guessing the API.

### Available skills and relevance to this project

| Skill              | Relevance here | Notes |
|--------------------|----------------|-------|
| `tanstack-start`   | **Essential**  | The framework. Server functions, middleware, API routes, SSR, Nitro deploy. We use this heavily. |
| `tanstack-router`  | **Essential**  | File-based routing, search params, loaders. In active use. |
| `tanstack-query`   | **Essential**  | Async state, caching, mutations, SSR/hydration. In active use. |
| `tanstack-devtools`| Useful         | Already wired (`@tanstack/react-devtools` + `devtools-vite`). |
| `tanstack-form`    | Maybe later    | Not yet adopted; consider if forms grow beyond the current hand-rolled inputs. |
| `tanstack-virtual` | Maybe later    | Not yet adopted; good fit if day/agenda lists get long. |
| `tanstack-pacer`   | Maybe later    | Debounce/throttle (⌘K search, drag); marginal — `date-fns`/utils cover most. |
| `tanstack-db`      | Skip           | Overlaps our react-query + Drizzle setup. |
| `tanstack-store`   | Skip           | Not needed; react-query + next-themes cover state. |
| `tanstack-table`   | Skip           | No datagrids in a time-boxing app. |
| `tanstack-ai`      | Skip           | No AI SDK usage. |
| `tanstack-ranger`  | Skip           | No range sliders. |
| `tanstack-cli`     | Skip           | Project already scaffolded. |
| `tanstack-config`  | Skip           | For building/publishing npm packages, not an app. |

> Note: the repo also ships bundle plugins (`tanstack-all`, `-core`, `-ui`, `-data`).
> Those are manifest-only and contain no `SKILL.md` — read the individual skills above.

To refresh the cache to the latest skills: `opensrc fetch tanstack-skills/tanstack-skills`.
