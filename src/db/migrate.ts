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
      // Self-provision the parent directory for local file DBs. Dynamic node imports
      // keep `node:*` out of the (client-bundled) static module graph — see db/client.ts.
      const url = process.env.DATABASE_URL ?? "file:./data/timeboxd.db"
      if (url.startsWith("file:")) {
        const { existsSync, mkdirSync } = await import("node:fs")
        const { dirname } = await import("node:path")
        const dir = dirname(url.slice("file:".length))
        if (dir && dir !== "." && !existsSync(dir)) {
          mkdirSync(dir, { recursive: true })
        }
      }
      await migrate(db, { migrationsFolder: "./drizzle" })
    })()
  }
  return ready
}
