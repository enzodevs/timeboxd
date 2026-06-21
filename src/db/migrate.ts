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
      await migrate(db, { migrationsFolder: "./drizzle" })
    })()
  }
  return ready
}
