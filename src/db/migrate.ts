import { migrate } from "drizzle-orm/libsql/migrator"

import { db } from "./client"
import { settings } from "./schema"

let ready: Promise<void> | null = null

/**
 * Runs migrations once per process and seeds singleton rows. Server functions
 * await this before touching the database so the app self-provisions its
 * SQLite file on first boot — no manual migration step required.
 */
export function ensureDb(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await migrate(db, { migrationsFolder: "./drizzle" })
      await db.insert(settings).values({ id: "app" }).onConflictDoNothing()
    })()
  }
  return ready
}
