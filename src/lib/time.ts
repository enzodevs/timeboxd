import { format, parse } from "date-fns"

export const PX_PER_HOUR = 64
export const SNAP_MIN = 15
export const DAY_MINUTES = 24 * 60
export const DEFAULT_BOX_MIN = 60

/** Local "YYYY-MM-DD" for a Date. */
export function ymd(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

/** Parse a local "YYYY-MM-DD" into a Date at local midnight. */
export function parseYmd(value: string): Date {
  return parse(value, "yyyy-MM-dd", new Date())
}

/** Local minutes-from-midnight for an ISO datetime string. */
export function minutesOfDay(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

/** Build an ISO datetime from a local day + minutes-from-midnight. */
export function isoFromDayMinutes(day: string, minutes: number): string {
  const base = parseYmd(day)
  const clamped = Math.max(0, Math.min(DAY_MINUTES - 1, Math.round(minutes)))
  base.setHours(Math.floor(clamped / 60), clamped % 60, 0, 0)
  return base.toISOString()
}

export function snap(minutes: number, step = SNAP_MIN): number {
  return Math.round(minutes / step) * step
}

/** Minutes-from-midnight → "7:00 PM". */
export function formatClock(minutes: number): string {
  const m = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES
  const h = Math.floor(m / 60)
  const mm = m % 60
  const mer = h < 12 ? "AM" : "PM"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(mm).padStart(2, "0")} ${mer}`
}

/** Hour label for the gutter: "3pm". */
export function formatHourLabel(hour: number): string {
  const h = ((hour % 24) + 24) % 24
  if (h === 0) return "12am"
  if (h === 12) return "12pm"
  return h < 12 ? `${h}am` : `${h - 12}pm`
}

/** "7:00 PM – 8:00 PM" from two ISO datetimes. */
export function formatRange(startIso: string, endIso: string): string {
  return `${formatClock(minutesOfDay(startIso))} - ${formatClock(minutesOfDay(endIso))}`
}

export interface Interval {
  start: number
  end: number
}

export interface Positioned<T> {
  item: T
  start: number
  end: number
  col: number
  cols: number
}

/**
 * Lays overlapping intervals side-by-side. Returns each item with the column it
 * occupies and the total number of columns in its overlap cluster, so the
 * renderer can compute width/left for parallel boxes.
 */
export function layoutIntervals<T>(
  items: Array<T & Interval>
): Array<Positioned<T>> {
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end)
  const result: Array<Positioned<T>> = []

  let cluster: Array<T & Interval> = []
  let clusterEnd = -Infinity

  const flush = () => {
    if (!cluster.length) return
    // Greedy column assignment within the cluster.
    const colEnds: number[] = []
    const assigned = cluster.map((it) => {
      let col = colEnds.findIndex((end) => end <= it.start)
      if (col === -1) {
        col = colEnds.length
        colEnds.push(it.end)
      } else {
        colEnds[col] = it.end
      }
      return { it, col }
    })
    const cols = colEnds.length
    for (const { it, col } of assigned) {
      result.push({ item: it, start: it.start, end: it.end, col, cols })
    }
    cluster = []
    clusterEnd = -Infinity
  }

  for (const it of sorted) {
    if (cluster.length && it.start >= clusterEnd) flush()
    cluster.push(it)
    clusterEnd = Math.max(clusterEnd, it.end)
  }
  flush()

  return result
}
