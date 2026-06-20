import { describe, expect, it } from "vitest"

import { parseTaskInput } from "./parse-task"

describe("parseTaskInput", () => {
  it("returns a plain title untouched", () => {
    const r = parseTaskInput("Buy milk")
    expect(r).toEqual({
      title: "Buy milk",
      tags: [],
      deepWork: false,
      start: null,
      end: null,
    })
  })

  it("extracts tags, deep-work flag and a time range", () => {
    const r = parseTaskInput("Study #school -d @7pm-8pm")
    expect(r.title).toBe("Study")
    expect(r.tags).toEqual(["school"])
    expect(r.deepWork).toBe(true)
    expect(r.start).toBe("19:00")
    expect(r.end).toBe("20:00")
  })

  it("supports a single start time", () => {
    const r = parseTaskInput("Focus @9am")
    expect(r.start).toBe("09:00")
    expect(r.end).toBeNull()
  })

  it("inherits the meridiem from the end of a range", () => {
    const r = parseTaskInput("@8-9am Plan the day")
    expect(r.title).toBe("Plan the day")
    expect(r.start).toBe("08:00")
    expect(r.end).toBe("09:00")
  })

  it("parses 24h times and multiple tags", () => {
    const r = parseTaskInput("Review #a #b @14:00-15:30")
    expect(r.tags).toEqual(["a", "b"])
    expect(r.start).toBe("14:00")
    expect(r.end).toBe("15:30")
  })

  it("handles the deep-work flag at the end", () => {
    const r = parseTaskInput("Write report -d")
    expect(r.title).toBe("Write report")
    expect(r.deepWork).toBe(true)
  })
})
