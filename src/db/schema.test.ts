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
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
  if (files.length === 0)
    throw new Error("no migration found - run pnpm db:generate")
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf8")
    for (const stmt of sql.split("--> statement-breakpoint")) {
      const s = stmt.trim()
      if (s) await client.execute(s)
    }
  }

  await db.insert(schema.user).values({
    id: "u1",
    name: "Owner",
    email: "owner@example.com",
    emailVerified: true,
  })
})

describe("schema round trip", () => {
  it("stores tags as JSON and booleans correctly", async () => {
    await db.insert(schema.tasks).values({
      id: "t1",
      userId: "u1",
      title: "Hello",
      tags: ["x", "y"],
      deepWork: true,
    })
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
      .values({
        userId: "u1",
        date: "2026-06-20",
        content: { type: "doc" },
        text: "hi",
      })
      .onConflictDoUpdate({
        target: [schema.notes.userId, schema.notes.date],
        set: { text: "updated" },
      })
    await db
      .insert(schema.notes)
      .values({
        userId: "u1",
        date: "2026-06-20",
        content: { type: "doc" },
        text: "second",
      })
      .onConflictDoUpdate({
        target: [schema.notes.userId, schema.notes.date],
        set: { text: "second" },
      })
    const [row] = await db
      .select()
      .from(schema.notes)
      .where(eq(schema.notes.userId, "u1"))
    expect(row?.text).toBe("second")
  })
})
