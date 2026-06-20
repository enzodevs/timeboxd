import { createServerFn } from "@tanstack/react-start"
import { asc, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db/client"
import { ensureDb } from "@/db/migrate"
import { timeboxes } from "@/db/schema"
import type { Timebox } from "@/db/schema"

const nowISO = () => new Date().toISOString()

const createInput = z.object({
  title: z.string().trim().min(1),
  start: z.string(),
  end: z.string(),
  date: z.string(),
  deepWork: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  color: z.string().nullable().optional(),
  taskId: z.string().nullable().optional(),
})

const patchInput = z.object({
  title: z.string().trim().min(1).optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  date: z.string().optional(),
  deepWork: z.boolean().optional(),
  completed: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  color: z.string().nullable().optional(),
  taskId: z.string().nullable().optional(),
  googleEventId: z.string().nullable().optional(),
})

export const listTimeboxes = createServerFn({ method: "GET" })
  .validator((d: { date: string }) => d)
  .handler(async ({ data }): Promise<Timebox[]> => {
    await ensureDb()
    return db
      .select()
      .from(timeboxes)
      .where(eq(timeboxes.date, data.date))
      .orderBy(asc(timeboxes.start))
  })

export const createTimebox = createServerFn({ method: "POST" })
  .validator((d: z.input<typeof createInput>) => createInput.parse(d))
  .handler(async ({ data }): Promise<Timebox> => {
    await ensureDb()
    const [row] = await db
      .insert(timeboxes)
      .values({
        id: crypto.randomUUID(),
        title: data.title,
        start: data.start,
        end: data.end,
        date: data.date,
        deepWork: data.deepWork ?? false,
        tags: data.tags ?? [],
        color: data.color ?? null,
        taskId: data.taskId ?? null,
        source: "local",
      })
      .returning()
    return row!
  })

export const updateTimebox = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: z.input<typeof patchInput> }) => ({
    id: z.string().parse(d.id),
    patch: patchInput.parse(d.patch),
  }))
  .handler(async ({ data }): Promise<Timebox> => {
    await ensureDb()
    const patch = { ...data.patch } as Record<string, unknown>
    if (data.patch.completed !== undefined) {
      patch.completedAt = data.patch.completed ? nowISO() : null
    }
    patch.updatedAt = nowISO()
    const [row] = await db
      .update(timeboxes)
      .set(patch)
      .where(eq(timeboxes.id, data.id))
      .returning()
    if (!row) throw new Error("Timebox not found")
    return row
  })

export const deleteTimebox = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    await ensureDb()
    await db.delete(timeboxes).where(eq(timeboxes.id, data.id))
    return { ok: true }
  })
