import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"

import { db } from "@/db/client"
import { ensureDb } from "@/db/migrate"
import { notes } from "@/db/schema"
import type { JsonValue, Note } from "@/db/schema"

export const getNote = createServerFn({ method: "GET" })
  .validator((d: { date: string }) => d)
  .handler(async ({ data }): Promise<Note | null> => {
    await ensureDb()
    const [row] = await db.select().from(notes).where(eq(notes.date, data.date))
    return row ?? null
  })

export const saveNote = createServerFn({ method: "POST" })
  .validator(
    (d: { date: string; content: JsonValue | null; text: string }) => d
  )
  .handler(async ({ data }): Promise<Note> => {
    await ensureDb()
    const updatedAt = new Date().toISOString()
    const [row] = await db
      .insert(notes)
      .values({
        date: data.date,
        content: data.content,
        text: data.text,
        updatedAt,
      })
      .onConflictDoUpdate({
        target: notes.date,
        set: { content: data.content, text: data.text, updatedAt },
      })
      .returning()
    return row!
  })
