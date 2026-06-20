import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db/client"
import { ensureDb } from "@/db/migrate"
import { settings } from "@/db/schema"
import type { Settings } from "@/db/schema"

const patchInput = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  timezone: z.string().nullable().optional(),
  dayStartHour: z.number().int().min(0).max(23).optional(),
  weekStart: z.number().int().min(0).max(1).optional(),
})

export const getSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<Settings> => {
    await ensureDb()
    const [row] = await db.select().from(settings).where(eq(settings.id, "app"))
    if (!row) throw new Error("Settings not initialized")
    return row
  }
)

export const updateSettings = createServerFn({ method: "POST" })
  .validator((d: z.input<typeof patchInput>) => patchInput.parse(d))
  .handler(async ({ data }): Promise<Settings> => {
    await ensureDb()
    const [row] = await db
      .update(settings)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(settings.id, "app"))
      .returning()
    return row!
  })
