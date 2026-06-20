import fs from "node:fs"
import path from "node:path"
import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import { eq } from "drizzle-orm"
import { beforeAll, describe, expect, it } from "vitest"

import * as schema from "./schema"

const client = createClient({ url: ":memory:" })
const db = drizzle(client, { schema })

beforeAll(async () => {
  const dir = path.resolve("drizzle")
  const file = fs.readdirSync(dir).find((f) => f.endsWith(".sql"))
  if (!file) throw new Error("no migration found — run pnpm db:generate")
  const sql = fs.readFileSync(path.join(dir, file), "utf8")
  for (const stmt of sql.split("--> statement-breakpoint")) {
    const s = stmt.trim()
    if (s) await client.execute(s)
  }
})

describe("schema round trip", () => {
  it("stores tags as JSON and booleans correctly", async () => {
    await db
      .insert(schema.tasks)
      .values({ id: "t1", title: "Hello", tags: ["x", "y"], deepWork: true })
    const [row] = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, "t1"))
    expect(row?.title).toBe("Hello")
    expect(row?.tags).toEqual(["x", "y"])
    expect(row?.deepWork).toBe(true)
    expect(row?.completed).toBe(false)
    expect(row?.list).toBe("today")
  })

  it("upserts a per-day note", async () => {
    await db
      .insert(schema.notes)
      .values({ date: "2026-06-20", content: { type: "doc" }, text: "hi" })
      .onConflictDoUpdate({
        target: schema.notes.date,
        set: { text: "updated" },
      })
    await db
      .insert(schema.notes)
      .values({ date: "2026-06-20", content: { type: "doc" }, text: "second" })
      .onConflictDoUpdate({
        target: schema.notes.date,
        set: { text: "second" },
      })
    const [row] = await db
      .select()
      .from(schema.notes)
      .where(eq(schema.notes.date, "2026-06-20"))
    expect(row?.text).toBe("second")
  })
})
