# timeboxd

Open-source **time-boxing** for your day. Plan your to-dos, drag them onto a
timeline as time-boxes, and braindump notes — all in one keyboard-friendly,
three-pane workspace. Optionally syncs with **Google Calendar** and
**Google Tasks**.

Self-hosted and local-first: your data lives in a single SQLite file on your
own machine. No account required.

> Built with TanStack Start, React 19, Tailwind v4, shadcn/ui, Drizzle + libSQL,
> dnd-kit and TipTap.

## Features

- **Three-pane workspace** — resizable To-do list, day calendar, and Notes.
- **Quick-add parser** — type `Study #school -d @7pm-8pm` to set a tag, mark
  deep work, and schedule a time in one line. Press <kbd>N</kbd> to focus the
  input from anywhere.
- **Drag & drop** — reorder to-dos, drag them to the **To-do Later** backlog, or
  drop them onto the timeline to create a time-box.
- **Time-boxes** — drag to move, drag the edges to resize (15-min snapping),
  overlapping boxes lay out side-by-side, with a live "now" indicator.
- **Notes** — a per-day rich-text braindump (bold, headings, lists, quotes,
  code, …) that autosaves.
- **Deep work, tags, completion** — quick-action menus on every to-do and
  time-box.
- **Google integration (optional)** — read Calendar events onto your timeline,
  push time-boxes to Google Calendar, and import Google Tasks as to-dos.
- **Light & dark themes.**

## Quick start

Requires Node 20+ and [pnpm](https://pnpm.io).

```bash
git clone https://github.com/enzodevs/timeboxd.git
cd timeboxd
pnpm install
cp .env.example .env        # optional: only needed for Google sync
pnpm dev
```

Open http://localhost:3000. The SQLite database is created and migrated
automatically on first run (at `./data/timeboxd.db`).

### Production

```bash
pnpm build
node .output/server/index.mjs
```

## Google Calendar & Tasks (optional)

The app works fully without Google. To enable two-way sync you provide your own
OAuth credentials:

1. In the [Google Cloud Console](https://console.cloud.google.com/), create a
   project and enable the **Google Calendar API** and **Google Tasks API**.
2. Under **APIs & Services → Credentials**, create an **OAuth client ID** of type
   **Web application**.
3. Add the authorized redirect URI:
   `http://localhost:3000/api/auth/google/callback`
   (match your `APP_URL`).
4. While your OAuth consent screen is in **Testing**, add your Google account as
   a **Test user**.
5. Put the credentials in `.env`:

   ```bash
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   APP_URL=http://localhost:3000
   ```

6. Restart, then open **Settings** (the person icon in the day bar) →
   **Connect Google**.

Tokens are stored in your local database and refreshed automatically.

## Tech stack

| Area         | Choice                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| Framework    | [TanStack Start](https://tanstack.com/start) + React 19                                                 |
| Styling      | Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com)                                                    |
| Database     | SQLite via [libSQL](https://github.com/tursodatabase/libsql) + [Drizzle ORM](https://orm.drizzle.team) |
| Data layer   | TanStack Query + server functions (optimistic UI)                                                      |
| Drag & drop  | [dnd-kit](https://dndkit.com)                                                                           |
| Notes editor | [TipTap](https://tiptap.dev)                                                                            |
| Google       | `google-auth-library` + Calendar/Tasks REST                                                            |

## Scripts

| Command            | Description                      |
| ------------------ | -------------------------------- |
| `pnpm dev`         | Start the dev server (port 3000) |
| `pnpm build`       | Production build                 |
| `pnpm typecheck`   | Type-check with `tsc`            |
| `pnpm lint`        | Lint with ESLint                 |
| `pnpm test`        | Run the test suite (Vitest)      |
| `pnpm db:generate` | Generate a Drizzle migration     |
| `pnpm db:migrate`  | Apply migrations                 |
| `pnpm db:studio`   | Open Drizzle Studio              |

## Contributing

Issues and PRs welcome. Run `pnpm typecheck && pnpm lint && pnpm test` before
opening a pull request.

## License

[MIT](./LICENSE)
