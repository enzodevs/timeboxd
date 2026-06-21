import { createServerFn } from "@tanstack/react-start"
import { and, desc, eq, isNotNull, sql } from "drizzle-orm"
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core"

import { db } from "@/db/client"
import { ensureDb } from "@/db/migrate"
import { notes, tasks, timeboxes } from "@/db/schema"
import { authMiddleware } from "@/lib/auth-middleware"

export interface SearchHit {
  type: "task" | "timebox" | "note"
  /** task/timebox id, or the note's date. */
  id: string
  /** task/timebox title, or a note snippet. */
  title: string
  /** Day to navigate to ("YYYY-MM-DD"); null for undated "later" tasks. */
  date: string | null
  /** ISO start/end for timeboxes (for time formatting). */
  start: string | null
  end: string | null
  /** Task list ("today" | "later"); null otherwise. */
  list: string | null
  completed: boolean
}

export interface SearchResults {
  tasks: SearchHit[]
  timeboxes: SearchHit[]
  notes: SearchHit[]
  total: number
}

const LIMIT = 6

/** Escape LIKE wildcards so user input matches literally. */
function likePattern(q: string): string {
  const escaped = q.replace(/[\\%_]/g, (c) => `\\${c}`)
  return `%${escaped}%`
}

/** A ~80-char window around the first match, for note previews. */
function snippet(text: string, q: string): string {
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return text.slice(0, 80).trim()
  const from = Math.max(0, i - 30)
  const to = Math.min(text.length, i + q.length + 50)
  return `${from > 0 ? "…" : ""}${text.slice(from, to).trim()}${
    to < text.length ? "…" : ""
  }`
}

/**
 * Search across tasks, timeboxes, and notes. Case-insensitive LIKE on the
 * indexed columns (notes carry a plain-text mirror in `notes.text`) — instant
 * at single-user scale. This is the seam: swap these three queries for an FTS5
 * virtual table (or sqlite-vss for semantic search) without touching callers.
 */
export const searchAll = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: { q: string }) => d)
  .handler(async ({ data, context }): Promise<SearchResults> => {
    const q = data.q.trim()
    if (!q) return { tasks: [], timeboxes: [], notes: [], total: 0 }
    await ensureDb()

    const pat = likePattern(q.toLowerCase())
    const matches = (col: AnySQLiteColumn) =>
      sql`lower(${col}) like ${pat} escape '\\'`

    const [taskRows, boxRows, noteRows] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(and(eq(tasks.userId, context.userId), matches(tasks.title)))
        .orderBy(desc(tasks.updatedAt))
        .limit(LIMIT),
      db
        .select()
        .from(timeboxes)
        .where(
          and(eq(timeboxes.userId, context.userId), matches(timeboxes.title))
        )
        .orderBy(desc(timeboxes.start))
        .limit(LIMIT),
      db
        .select()
        .from(notes)
        .where(
          and(
            eq(notes.userId, context.userId),
            isNotNull(notes.text),
            matches(notes.text)
          )
        )
        .orderBy(desc(notes.updatedAt))
        .limit(LIMIT),
    ])

    const tasksOut: SearchHit[] = taskRows.map((t) => ({
      type: "task",
      id: t.id,
      title: t.title,
      date: t.date,
      start: null,
      end: null,
      list: t.list,
      completed: t.completed,
    }))
    const boxesOut: SearchHit[] = boxRows.map((b) => ({
      type: "timebox",
      id: b.id,
      title: b.title,
      date: b.date,
      start: b.start,
      end: b.end,
      list: null,
      completed: b.completed,
    }))
    const notesOut: SearchHit[] = noteRows.map((n) => ({
      type: "note",
      id: n.date,
      title: snippet(n.text ?? "", q),
      date: n.date,
      start: null,
      end: null,
      list: null,
      completed: false,
    }))

    return {
      tasks: tasksOut,
      timeboxes: boxesOut,
      notes: notesOut,
      total: tasksOut.length + boxesOut.length + notesOut.length,
    }
  })
