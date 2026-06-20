import type { OAuth2Client } from "google-auth-library"

const CAL = "https://www.googleapis.com/calendar/v3"
const TASKS = "https://tasks.googleapis.com/tasks/v1"

export interface GCalEvent {
  id: string
  summary?: string
  htmlLink?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
}

export interface GTaskList {
  id: string
  title: string
}

export interface GTask {
  id: string
  title?: string
  status?: "needsAction" | "completed"
  due?: string
  notes?: string
}

async function call<T>(
  client: OAuth2Client,
  url: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  const res = await client.request<T>({
    url,
    method: init?.method ?? "GET",
    ...(init?.body ? { body: JSON.stringify(init.body) } : {}),
    headers: { "Content-Type": "application/json" },
  })
  return res.data
}

export async function listEvents(
  client: OAuth2Client,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<GCalEvent[]> {
  const url = `${CAL}/calendars/${encodeURIComponent(
    calendarId
  )}/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(
    timeMin
  )}&timeMax=${encodeURIComponent(timeMax)}`
  const data = await call<{ items?: GCalEvent[] }>(client, url)
  return data.items ?? []
}

export async function upsertEvent(
  client: OAuth2Client,
  calendarId: string,
  event: { summary: string; start: string; end: string },
  eventId?: string | null
): Promise<GCalEvent> {
  const body = {
    summary: event.summary,
    start: { dateTime: event.start },
    end: { dateTime: event.end },
  }
  const base = `${CAL}/calendars/${encodeURIComponent(calendarId)}/events`
  if (eventId) {
    return call<GCalEvent>(client, `${base}/${encodeURIComponent(eventId)}`, {
      method: "PATCH",
      body,
    })
  }
  return call<GCalEvent>(client, base, { method: "POST", body })
}

export async function getPrimaryEmail(
  client: OAuth2Client
): Promise<string | null> {
  try {
    const data = await call<{ email?: string }>(
      client,
      "https://www.googleapis.com/oauth2/v2/userinfo"
    )
    return data.email ?? null
  } catch {
    return null
  }
}

export async function listTaskLists(
  client: OAuth2Client
): Promise<GTaskList[]> {
  const data = await call<{ items?: GTaskList[] }>(
    client,
    `${TASKS}/users/@me/lists`
  )
  return data.items ?? []
}

export async function listGTasks(
  client: OAuth2Client,
  taskListId: string
): Promise<GTask[]> {
  const data = await call<{ items?: GTask[] }>(
    client,
    `${TASKS}/lists/${encodeURIComponent(taskListId)}/tasks?showCompleted=false&maxResults=100`
  )
  return data.items ?? []
}
