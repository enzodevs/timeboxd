import { createServerFn } from "@tanstack/react-start"
import { and, asc, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db/client"
import { ensureDb } from "@/db/migrate"
import { timeboxes } from "@/db/schema"
import type { Timebox } from "@/db/schema"
import { authMiddleware } from "@/lib/auth-middleware"
import { subscriptionMiddleware } from "@/lib/subscription-middleware"

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
  .middleware([authMiddleware])
  .validator((d: { date: string }) => d)
  .handler(async ({ data, context }): Promise<Timebox[]> => {
    await ensureDb()
    return db
      .select()
      .from(timeboxes)
      .where(
        and(eq(timeboxes.date, data.date), eq(timeboxes.userId, context.userId))
      )
      .orderBy(asc(timeboxes.start))
  })

export const createTimebox = createServerFn({ method: "POST" })
  .middleware([subscriptionMiddleware])
  .validator((d: z.input<typeof createInput>) => createInput.parse(d))
  .handler(async ({ data, context }): Promise<Timebox> => {
    await ensureDb()
    const [row] = await db
      .insert(timeboxes)
      .values({
        id: crypto.randomUUID(),
        userId: context.userId,
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
  .middleware([subscriptionMiddleware])
  .validator((d: { id: string; patch: z.input<typeof patchInput> }) => ({
    id: z.string().parse(d.id),
    patch: patchInput.parse(d.patch),
  }))
  .handler(async ({ data, context }): Promise<Timebox> => {
    await ensureDb()
    const patch = { ...data.patch } as Record<string, unknown>
    if (data.patch.completed !== undefined) {
      patch.completedAt = data.patch.completed ? nowISO() : null
    }
    patch.updatedAt = nowISO()
    const [row] = await db
      .update(timeboxes)
      .set(patch)
      .where(
        and(eq(timeboxes.id, data.id), eq(timeboxes.userId, context.userId))
      )
      .returning()
    if (!row) throw new Error("Timebox not found")
    return row
  })

export const deleteTimebox = createServerFn({ method: "POST" })
  .middleware([subscriptionMiddleware])
  .validator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await ensureDb()
    await db
      .delete(timeboxes)
      .where(
        and(eq(timeboxes.id, data.id), eq(timeboxes.userId, context.userId))
      )
    return { ok: true }
  })
