import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import * as schema from "./schema"

// IMPORTANT: keep this module free of `node:*` imports and top-level side effects.
// It gets pulled into the client bundle (via server-fn `.middleware()` references),
// where TanStack Start mocks node built-ins — a top-level `node:path`/`node:fs` call
// here throws during hydration and silently blanks the whole app. Local-directory
// creation lives in db/migrate.ts (server-only, dynamic import).
const url = process.env.DATABASE_URL ?? "file:./data/timeboxd.db"

function createDb() {
  return drizzle(
    createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN }),
    { schema },
  )
}

// Only construct the libSQL client on the server. This module is reachable from the
// client bundle (via server-fn `.middleware()` references), and the browser libSQL
// client throws on `file:` URLs and needs node APIs. On the client `db` stays an unused
// `undefined` — every real query runs inside a server-only (stripped) handler.
export const db = (
  typeof window === "undefined" ? createDb() : undefined
) as ReturnType<typeof createDb>
export { schema }
