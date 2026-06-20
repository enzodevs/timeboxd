import { sql } from "drizzle-orm"
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"

/** A JSON-serializable value (used for TipTap note documents). */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

/** A to-do. Lives in the "today" list for a given date, or the undated "later" backlog. */
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  tags: text("tags", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  deepWork: integer("deep_work", { mode: "boolean" }).notNull().default(false),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  completedAt: text("completed_at"),
  /** "today" | "later" */
  list: text("list").notNull().default("today"),
  /** "YYYY-MM-DD" for dated tasks; null for the "later" backlog. */
  date: text("date"),
  /** Optional planned time chip, "HH:mm". */
  scheduledTime: text("scheduled_time"),
  estimateMin: integer("estimate_min"),
  sortOrder: real("sort_order").notNull().default(0),
  googleTaskId: text("google_task_id"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
})

/** A scheduled block on the day timeline. */
export const timeboxes = sqliteTable("timeboxes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  /** ISO datetime. */
  start: text("start").notNull(),
  end: text("end").notNull(),
  /** "YYYY-MM-DD" (local day the box belongs to). */
  date: text("date").notNull(),
  deepWork: integer("deep_work", { mode: "boolean" }).notNull().default(false),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  completedAt: text("completed_at"),
  color: text("color"),
  tags: text("tags", { mode: "json" })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  /** Optional link back to the task that spawned this box. */
  taskId: text("task_id"),
  googleEventId: text("google_event_id"),
  /** "local" | "google" */
  source: text("source").notNull().default("local"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
})

/** Per-day braindump note (TipTap JSON document + plain-text mirror). */
export const notes = sqliteTable("notes", {
  /** "YYYY-MM-DD". */
  date: text("date").primaryKey(),
  content: text("content", { mode: "json" }).$type<JsonValue>(),
  text: text("text"),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
})

/** OAuth integration state. Single row keyed by provider id (e.g. "google"). */
export const integrations = sqliteTable("integrations", {
  id: text("id").primaryKey(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  /** Epoch milliseconds. */
  expiresAt: integer("expires_at"),
  scope: text("scope"),
  email: text("email"),
  calendarId: text("calendar_id").default("primary"),
  taskListId: text("task_list_id").default("@default"),
  syncEnabled: integer("sync_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
})

/** App settings. Single row keyed by id = "app". */
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(),
  theme: text("theme").notNull().default("light"),
  timezone: text("timezone"),
  /** First hour shown on the timeline (0-23). */
  dayStartHour: integer("day_start_hour").notNull().default(0),
  /** 0 = Sunday, 1 = Monday. */
  weekStart: integer("week_start").notNull().default(1),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
})

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
export type Timebox = typeof timeboxes.$inferSelect
export type NewTimebox = typeof timeboxes.$inferInsert
export type Note = typeof notes.$inferSelect
export type Integration = typeof integrations.$inferSelect
export type Settings = typeof settings.$inferSelect
