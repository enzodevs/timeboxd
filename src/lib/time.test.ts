import { describe, expect, it } from "vitest"

import {
  formatClock,
  isoFromDayMinutes,
  layoutIntervals,
  minutesOfDay,
} from "./time"

describe("formatClock", () => {
  it("formats 12-hour times", () => {
    expect(formatClock(0)).toBe("12:00 AM")
    expect(formatClock(12 * 60)).toBe("12:00 PM")
    expect(formatClock(13 * 60 + 30)).toBe("1:30 PM")
    expect(formatClock(7 * 60)).toBe("7:00 AM")
  })
})

describe("isoFromDayMinutes / minutesOfDay round trip", () => {
  it("preserves local minutes-of-day", () => {
    const iso = isoFromDayMinutes("2026-06-20", 9 * 60 + 30)
    expect(minutesOfDay(iso)).toBe(9 * 60 + 30)
  })
})

describe("layoutIntervals", () => {
  it("places overlapping intervals in separate columns", () => {
    const out = layoutIntervals([
      { id: "a", start: 0, end: 60 },
      { id: "b", start: 30, end: 90 },
      { id: "c", start: 120, end: 180 },
    ])
    const byId = Object.fromEntries(out.map((p) => [p.item.id, p]))
    expect(byId.a?.cols).toBe(2)
    expect(byId.b?.cols).toBe(2)
    expect(byId.a?.col).not.toBe(byId.b?.col)
    expect(byId.c?.cols).toBe(1)
    expect(byId.c?.col).toBe(0)
  })
})
