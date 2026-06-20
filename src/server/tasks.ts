import { createServerFn } from "@tanstack/react-start"
import { and, asc, eq, sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db/client"
import { ensureDb } from "@/db/migrate"
import { tasks } from "@/db/schema"
import type { Task } from "@/db/schema"

const nowISO = () => new Date().toISOString()

const createInput = z.object({
  title: z.string().trim().min(1),
  tags: z.array(z.string()).optional(),
  deepWork: z.boolean().optional(),
  list: z.enum(["today", "later"]).optional(),
  date: z.string().nullable().optional(),
  scheduledTime: z.string().nullable().optional(),
  estimateMin: z.number().int().positive().nullable().optional(),
})

const patchInput = z.object({
  title: z.string().trim().min(1).optional(),
  tags: z.array(z.string()).optional(),
  deepWork: z.boolean().optional(),
  completed: z.boolean().optional(),
  list: z.enum(["today", "later"]).optional(),
  date: z.string().nullable().optional(),
  scheduledTime: z.string().nullable().optional(),
  estimateMin: z.number().int().nullable().optional(),
  sortOrder: z.number().optional(),
})

export type TaskLists = { today: Task[]; later: Task[] }

/** Returns the dated "today" list plus the undated "later" backlog. */
export const listTasks = createServerFn({ method: "GET" })
  .validator((d: { date: string }) => d)
  .handler(async ({ data }): Promise<TaskLists> => {
    await ensureDb()
    const today = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.list, "today"), eq(tasks.date, data.date)))
      .orderBy(asc(tasks.sortOrder), asc(tasks.createdAt))
    const later = await db
      .select()
      .from(tasks)
      .where(eq(tasks.list, "later"))
      .orderBy(asc(tasks.sortOrder), asc(tasks.createdAt))
    return { today, later }
  })

export const createTask = createServerFn({ method: "POST" })
  .validator((d: z.input<typeof createInput>) => createInput.parse(d))
  .handler(async ({ data }): Promise<Task> => {
    await ensureDb()
    const list = data.list ?? "today"
    const date = list === "later" ? null : (data.date ?? null)
    const agg = await db
      .select({ max: sql<number>`coalesce(max(${tasks.sortOrder}), -1)` })
      .from(tasks)
      .where(
        list === "later"
          ? eq(tasks.list, "later")
          : and(eq(tasks.list, "today"), eq(tasks.date, date as string))
      )
    const maxOrder = agg[0]?.max ?? -1
    const [row] = await db
      .insert(tasks)
      .values({
        id: crypto.randomUUID(),
        title: data.title,
        tags: data.tags ?? [],
        deepWork: data.deepWork ?? false,
        list,
        date,
        scheduledTime: data.scheduledTime ?? null,
        estimateMin: data.estimateMin ?? null,
        sortOrder: maxOrder + 1,
      })
      .returning()
    return row!
  })

export const updateTask = createServerFn({ method: "POST" })
  .validator((d: { id: string; patch: z.input<typeof patchInput> }) => ({
    id: z.string().parse(d.id),
    patch: patchInput.parse(d.patch),
  }))
  .handler(async ({ data }): Promise<Task> => {
    await ensureDb()
    const patch = { ...data.patch } as Record<string, unknown>
    if (data.patch.completed !== undefined) {
      patch.completedAt = data.patch.completed ? nowISO() : null
    }
    patch.updatedAt = nowISO()
    const [row] = await db
      .update(tasks)
      .set(patch)
      .where(eq(tasks.id, data.id))
      .returning()
    if (!row) throw new Error("Task not found")
    return row
  })

/** Batch update used for drag reordering and moving between lists. */
export const reorderTasks = createServerFn({ method: "POST" })
  .validator(
    (d: {
      updates: Array<{
        id: string
        sortOrder: number
        list?: "today" | "later"
        date?: string | null
      }>
    }) => d
  )
  .handler(async ({ data }) => {
    await ensureDb()
    for (const u of data.updates) {
      const set: Record<string, unknown> = {
        sortOrder: u.sortOrder,
        updatedAt: nowISO(),
      }
      if (u.list !== undefined) set.list = u.list
      if (u.date !== undefined) set.date = u.list === "later" ? null : u.date
      await db.update(tasks).set(set).where(eq(tasks.id, u.id))
    }
    return { ok: true }
  })

export const deleteTask = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    await ensureDb()
    await db.delete(tasks).where(eq(tasks.id, data.id))
    return { ok: true }
  })

/** Used by Google Tasks import to avoid duplicating already-synced tasks. */
export const findTaskByGoogleId = createServerFn({ method: "GET" })
  .validator((d: { googleTaskId: string }) => d)
  .handler(async ({ data }): Promise<Task | null> => {
    await ensureDb()
    const [row] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.googleTaskId, data.googleTaskId))
    return row ?? null
  })
