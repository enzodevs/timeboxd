import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import type { OAuth2Client } from "google-auth-library"

import { db } from "@/db/client"
import { ensureDb } from "@/db/migrate"
import { integrations, tasks, timeboxes } from "@/db/schema"
import {
  buildAuthUrl,
  createOAuthClient,
  googleConfigured,
} from "@/lib/google/oauth"
import {
  listEvents,
  listGTasks,
  listTaskLists,
  upsertEvent,
} from "@/lib/google/api"
import { DAY_MINUTES, isoFromDayMinutes } from "@/lib/time"

const nowISO = () => new Date().toISOString()

async function loadIntegration() {
  const [row] = await db
    .select()
    .from(integrations)
    .where(eq(integrations.id, "google"))
  return row ?? null
}

/** An OAuth client primed with stored tokens (auto-refreshes + persists). */
async function getAuthedClient(): Promise<OAuth2Client | null> {
  if (!googleConfigured()) return null
  const row = await loadIntegration()
  if (!row?.refreshToken) return null
  const client = createOAuthClient()
  client.setCredentials({
    access_token: row.accessToken ?? undefined,
    refresh_token: row.refreshToken,
    expiry_date: row.expiresAt ?? undefined,
  })
  client.on("tokens", (tokens) => {
    void db
      .update(integrations)
      .set({
        accessToken: tokens.access_token ?? row.accessToken,
        expiresAt: tokens.expiry_date ?? row.expiresAt,
        ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
        updatedAt: nowISO(),
      })
      .where(eq(integrations.id, "google"))
  })
  return client
}

export const getGoogleStatus = createServerFn({ method: "GET" }).handler(
  async () => {
    await ensureDb()
    const row = await loadIntegration()
    return {
      configured: googleConfigured(),
      connected: Boolean(row?.refreshToken),
      email: row?.email ?? null,
      syncEnabled: row?.syncEnabled ?? false,
      calendarId: row?.calendarId ?? "primary",
      taskListId: row?.taskListId ?? "@default",
    }
  }
)

export const getGoogleAuthUrl = createServerFn({ method: "POST" }).handler(
  async () => {
    if (!googleConfigured()) {
      throw new Error("Google OAuth is not configured on the server.")
    }
    return { url: buildAuthUrl("timeboxd") }
  }
)

export const disconnectGoogle = createServerFn({ method: "POST" }).handler(
  async () => {
    await ensureDb()
    await db.delete(integrations).where(eq(integrations.id, "google"))
    return { ok: true }
  }
)

export interface ExternalEvent {
  id: string
  title: string
  start: string
  end: string
  htmlLink: string | null
}

export const getGoogleEvents = createServerFn({ method: "GET" })
  .validator((d: { date: string }) => d)
  .handler(async ({ data }): Promise<ExternalEvent[]> => {
    const client = await getAuthedClient()
    if (!client) return []
    const row = await loadIntegration()
    const calId = row?.calendarId ?? "primary"
    try {
      const events = await listEvents(
        client,
        calId,
        isoFromDayMinutes(data.date, 0),
        isoFromDayMinutes(data.date, DAY_MINUTES - 1)
      )
      return events
        .filter((e) => e.start?.dateTime && e.end?.dateTime)
        .map((e) => ({
          id: e.id,
          title: e.summary ?? "(no title)",
          start: e.start!.dateTime!,
          end: e.end!.dateTime!,
          htmlLink: e.htmlLink ?? null,
        }))
    } catch {
      return []
    }
  })

export const pushTimeboxToGoogle = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }): Promise<{ htmlLink: string | null }> => {
    await ensureDb()
    const client = await getAuthedClient()
    if (!client) throw new Error("Google is not connected.")
    const row = await loadIntegration()
    const calId = row?.calendarId ?? "primary"
    const [box] = await db
      .select()
      .from(timeboxes)
      .where(eq(timeboxes.id, data.id))
    if (!box) throw new Error("Timebox not found.")
    const ev = await upsertEvent(
      client,
      calId,
      { summary: box.title, start: box.start, end: box.end },
      box.googleEventId
    )
    await db
      .update(timeboxes)
      .set({ googleEventId: ev.id, updatedAt: nowISO() })
      .where(eq(timeboxes.id, box.id))
    return { htmlLink: ev.htmlLink ?? null }
  })

export const importGoogleTasks = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ imported: number }> => {
    await ensureDb()
    const client = await getAuthedClient()
    if (!client) throw new Error("Google is not connected.")
    const row = await loadIntegration()
    const listId = row?.taskListId ?? "@default"
    const gtasks = await listGTasks(client, listId)
    let imported = 0
    for (const gt of gtasks) {
      if (!gt.title) continue
      const [existing] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.googleTaskId, gt.id))
      if (existing) continue
      await db.insert(tasks).values({
        id: crypto.randomUUID(),
        title: gt.title,
        list: "later",
        date: null,
        sortOrder: Date.now() + imported,
        googleTaskId: gt.id,
      })
      imported++
    }
    return { imported }
  }
)

export const getGoogleLists = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ taskLists: { id: string; title: string }[] }> => {
    const client = await getAuthedClient()
    if (!client) return { taskLists: [] }
    try {
      const lists = await listTaskLists(client)
      return { taskLists: lists.map((l) => ({ id: l.id, title: l.title })) }
    } catch {
      return { taskLists: [] }
    }
  }
)
