import { existsSync, mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"

import * as schema from "./schema"

const url = process.env.DATABASE_URL ?? "file:./data/timeboxd.db"

// Ensure the parent directory exists for local file-based databases.
if (url.startsWith("file:")) {
  const filePath = url.slice("file:".length)
  const dir = dirname(filePath)
  if (dir && dir !== "." && !existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

const client = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
})

export const db = drizzle(client, { schema })
export { schema }
