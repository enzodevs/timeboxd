import { sql } from "drizzle-orm"
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core"

/** A JSON-serializable value (used for TipTap note documents). */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

const timestampMs = sql`(cast(unixepoch('subsecond') * 1000 as integer))`

// --- better-auth tables ---
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(timestampMs),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(timestampMs)
    .$onUpdate(() => new Date()),
})

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(timestampMs),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("session_userId_idx").on(t.userId)]
)

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(timestampMs),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("account_userId_idx").on(t.userId)]
)

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(timestampMs),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(timestampMs)
      .$onUpdate(() => new Date()),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)]
)

/** A to-do. Lives in the "today" list for a given date, or the undated "later" backlog. */
export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    tags: text("tags", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    deepWork: integer("deep_work", { mode: "boolean" })
      .notNull()
      .default(false),
    completed: integer("completed", { mode: "boolean" })
      .notNull()
      .default(false),
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
  },
  (t) => [index("tasks_user_list_date_idx").on(t.userId, t.list, t.date)]
)

/** A scheduled block on the day timeline. */
export const timeboxes = sqliteTable(
  "timeboxes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    /** ISO datetime. */
    start: text("start").notNull(),
    end: text("end").notNull(),
    /** "YYYY-MM-DD" (local day the box belongs to). */
    date: text("date").notNull(),
    deepWork: integer("deep_work", { mode: "boolean" })
      .notNull()
      .default(false),
    completed: integer("completed", { mode: "boolean" })
      .notNull()
      .default(false),
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
  },
  (t) => [index("timeboxes_user_date_idx").on(t.userId, t.date)]
)

/** Per-day braindump note (TipTap JSON document + plain-text mirror). */
export const notes = sqliteTable(
  "notes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** "YYYY-MM-DD". */
    date: text("date").notNull(),
    content: text("content", { mode: "json" }).$type<JsonValue>(),
    text: text("text"),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (t) => [primaryKey({ columns: [t.userId, t.date] })]
)

/** OAuth integration state. One row per user/provider pair. */
export const integrations = sqliteTable(
  "integrations",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
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
  },
  (t) => [primaryKey({ columns: [t.userId, t.provider] })]
)

/** App settings. One row per user. */
export const settings = sqliteTable("settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
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

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    currentPeriodEnd: integer("current_period_end", { mode: "timestamp_ms" }),
    cancelAtPeriodEnd: integer("cancel_at_period_end", {
      mode: "boolean",
    })
      .notNull()
      .default(false),
    lsCustomerId: text("ls_customer_id"),
    lsVariantId: text("ls_variant_id"),
    lsProductName: text("ls_product_name"),
    customerPortalUrl: text("customer_portal_url"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("subscriptions_user_idx").on(t.userId)]
)

export type User = typeof user.$inferSelect
export type Session = typeof session.$inferSelect
export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
export type Timebox = typeof timeboxes.$inferSelect
export type NewTimebox = typeof timeboxes.$inferInsert
export type Note = typeof notes.$inferSelect
export type Integration = typeof integrations.$inferSelect
export type Settings = typeof settings.$inferSelect
export type Subscription = typeof subscriptions.$inferSelect
