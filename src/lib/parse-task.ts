export interface ParsedTask {
  title: string
  tags: string[]
  deepWork: boolean
  /** "HH:mm" 24h, or null. */
  start: string | null
  end: string | null
}

interface Clock {
  h: number
  m: number
  mer?: string
}

function to24h(h: number, m: number, mer: string | undefined): string {
  let hh = h
  if (mer) {
    const lower = mer.toLowerCase()
    if (lower === "pm" && hh < 12) hh += 12
    if (lower === "am" && hh === 12) hh = 0
  }
  hh = Math.max(0, Math.min(23, hh))
  const mm = Math.max(0, Math.min(59, m))
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
}

function parseClock(raw: string): Clock | null {
  const match = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (!match?.[1]) return null
  return {
    h: parseInt(match[1], 10),
    m: match[2] ? parseInt(match[2], 10) : 0,
    mer: match[3]?.toLowerCase(),
  }
}

function parseTimeSpec(spec: string): {
  start: string | null
  end: string | null
} {
  const [a, b] = spec.split("-").map((s) => s.trim())
  const ca = a ? parseClock(a) : null
  if (!ca) return { start: null, end: null }
  const cb = b ? parseClock(b) : null
  // "8-9am" — the meridiem on the end applies to the start too.
  if (cb && !ca.mer && cb.mer) ca.mer = cb.mer
  return {
    start: to24h(ca.h, ca.m, ca.mer),
    end: cb ? to24h(cb.h, cb.m, cb.mer ?? ca.mer) : null,
  }
}

/**
 * Parses quick-add syntax: `#tag` adds tags, `-d` flags deep work,
 * `@8am-9am` / `@14:00` sets a time (range or start). Everything else is the title.
 */
export function parseTaskInput(input: string): ParsedTask {
  let text = ` ${input} `
  const tags: string[] = []
  let deepWork = false
  let start: string | null = null
  let end: string | null = null

  // @time — keep the last one that parses.
  text = text.replace(/@(\S+)/g, (_m, spec: string) => {
    const t = parseTimeSpec(spec)
    if (t.start) {
      start = t.start
      end = t.end
    }
    return " "
  })

  // #tags
  text = text.replace(/#([\p{L}\p{N}_-]+)/gu, (_m, tag: string) => {
    if (!tags.includes(tag)) tags.push(tag)
    return " "
  })

  // -d / --deep deep-work flag (standalone token)
  if (/(^|\s)-{1,2}d(eep)?(\s|$)/i.test(text)) {
    deepWork = true
    text = text.replace(/(^|\s)-{1,2}d(eep)?(?=\s|$)/gi, " ")
  }

  return {
    title: text.replace(/\s+/g, " ").trim(),
    tags,
    deepWork,
    start,
    end,
  }
}
