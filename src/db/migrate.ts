import { migrate } from "drizzle-orm/libsql/migrator"

import { db } from "./client"

let ready: Promise<void> | null = null

/**
 * Runs migrations once per process. Server functions await this before touching
 * the database so the app self-provisions its SQLite file on first boot.
 */
export function ensureDb(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const url = process.env.DATABASE_URL ?? "file:./data/timeboxd.db"
      // Remote (Turso/libSQL) databases are migrated out-of-band via
      // `drizzle-kit migrate` — the `./drizzle` folder isn't bundled into the
      // serverless runtime, so calling migrate() there throws "Can't find
      // meta/_journal.json". Only local file DBs self-provision + migrate here.
      if (!url.startsWith("file:")) return
      // Self-provision the parent directory. Dynamic node imports keep `node:*`
      // out of the (client-bundled) static module graph — see db/client.ts.
      const { existsSync, mkdirSync } = await import("node:fs")
      const { dirname } = await import("node:path")
      const dir = dirname(url.slice("file:".length))
      if (dir && dir !== "." && !existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      await migrate(db, { migrationsFolder: "./drizzle" })
    })()
  }
  return ready
}
