import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db/client"
import { ensureDb } from "@/db/migrate"
import { settings } from "@/db/schema"
import type { Settings } from "@/db/schema"
import { authMiddleware } from "@/lib/auth-middleware"
import { subscriptionMiddleware } from "@/lib/subscription-middleware"

const patchInput = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  timezone: z.string().nullable().optional(),
  dayStartHour: z.number().int().min(0).max(23).optional(),
  weekStart: z.number().int().min(0).max(1).optional(),
})

export const getSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Settings> => {
    await ensureDb()
    const [row] = await db
      .select()
      .from(settings)
      .where(eq(settings.userId, context.userId))
    if (row) return row
    const [created] = await db
      .insert(settings)
      .values({ userId: context.userId })
      .onConflictDoNothing()
      .returning()
    if (created) return created
    const [existing] = await db
      .select()
      .from(settings)
      .where(eq(settings.userId, context.userId))
    if (!existing) throw new Error("Settings not initialized")
    return existing
  })

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([subscriptionMiddleware])
  .validator((d: z.input<typeof patchInput>) => patchInput.parse(d))
  .handler(async ({ data, context }): Promise<Settings> => {
    await ensureDb()
    const [row] = await db
      .update(settings)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(settings.userId, context.userId))
      .returning()
    return row!
  })
