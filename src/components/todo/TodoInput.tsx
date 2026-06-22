import * as React from "react"
import { BrainIcon, ClockIcon, HashIcon } from "@phosphor-icons/react"

import { parseTaskInput } from "@/lib/parse-task"
import { isoFromDayMinutes } from "@/lib/time"
import { cn } from "@/lib/utils"
import { useTaskMutations } from "@/hooks/use-tasks"
import { useTimeboxMutations } from "@/hooks/use-timeboxes"
import { TransitionDropdown } from "@/components/ui/transition-dropdown"

function hhmmToMin(hhmm: string): number {
  const [h = 0, m = 0] = hhmm.split(":").map(Number)
  return h * 60 + m
}

interface Suggestion {
  label: string
  hint?: string
  insert: string
  icon: React.ReactNode
}

const SLASH_COMMANDS: Suggestion[] = [
  { label: "Deep work", hint: "-d", insert: "-d ", icon: <BrainIcon /> },
  { label: "Add tag", hint: "#tag", insert: "#", icon: <HashIcon /> },
  { label: "Set time", hint: "@8am-9am", insert: "@", icon: <ClockIcon /> },
]

function fmt12(h: number): string {
  const hour = ((h % 24) + 24) % 24
  const mer = hour < 12 ? "am" : "pm"
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}${mer}`
}

// Hourly blocks from 6am to 10pm for the "@" time picker.
const TIME_OPTIONS: Suggestion[] = Array.from({ length: 16 }, (_, k) => {
  const h = 6 + k
  return {
    label: `${fmt12(h)} – ${fmt12(h + 1)}`,
    insert: `@${fmt12(h)}-${fmt12(h + 1)} `,
    icon: <ClockIcon />,
  }
})

function filterSuggestions(list: Suggestion[], query: string): Suggestion[] {
  const q = query.toLowerCase().replace(/\s/g, "")
  if (!q) return list
  return list.filter(
    (s) =>
      s.label.toLowerCase().replace(/\s/g, "").includes(q) ||
      s.hint?.toLowerCase().includes(q)
  )
}

export function TodoInput({
  date,
  readOnly,
}: {
  date: string
  readOnly?: boolean
}) {
  const [value, setValue] = React.useState("")
  const [caret, setCaret] = React.useState(0)
  const [active, setActive] = React.useState(0)
  const [dismissed, setDismissed] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { create } = useTaskMutations(date)
  const { create: createBox } = useTimeboxMutations(date)

  // Detect a "/" or "@" token ending at the caret to drive the picker.
  const trigger = React.useMemo(() => {
    const before = value.slice(0, caret)
    const m = /(?:^|\s)([/@])(\S*)$/.exec(before)
    if (!m) return null
    const symbol = m[1] as "/" | "@"
    const query = m[2] ?? ""
    return { kind: symbol, query, tokenStart: caret - query.length - 1 }
  }, [value, caret])

  const items = React.useMemo(() => {
    if (!trigger) return []
    return trigger.kind === "/"
      ? filterSuggestions(SLASH_COMMANDS, trigger.query)
      : filterSuggestions(TIME_OPTIONS, trigger.query)
  }, [trigger])

  const menuOpen = Boolean(trigger) && items.length > 0 && !dismissed
  const clampedActive = items.length ? Math.min(active, items.length - 1) : 0

  React.useEffect(() => setActive(0), [trigger?.kind, trigger?.query])

  const parsed = React.useMemo(() => parseTaskInput(value), [value])

  // Global "N" shortcut (and the palette's "New task" action) focus quick-add.
  React.useEffect(() => {
    const focus = () => inputRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (readOnly) return
      if (e.key.toLowerCase() !== "n") return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = document.activeElement
      const tag = el?.tagName
      const editable =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (el as HTMLElement | null)?.isContentEditable
      if (editable) return
      e.preventDefault()
      focus()
    }
    window.addEventListener("keydown", handler)
    window.addEventListener("timeboxd:focus-new-task", focus)
    return () => {
      window.removeEventListener("keydown", handler)
      window.removeEventListener("timeboxd:focus-new-task", focus)
    }
  }, [readOnly])

  const syncCaret = (el: HTMLInputElement) => setCaret(el.selectionStart ?? 0)

  const applySuggestion = (s: Suggestion) => {
    if (!trigger) return
    const next =
      value.slice(0, trigger.tokenStart) + s.insert + value.slice(caret)
    const pos = trigger.tokenStart + s.insert.length
    setValue(next)
    setDismissed(false)
    requestAnimationFrame(() => {
      const el = inputRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(pos, pos)
      setCaret(pos)
    })
  }

  const submit = async () => {
    if (readOnly) return
    if (!parsed.title) return
    setValue("")
    const task = await create.mutateAsync({
      title: parsed.title,
      tags: parsed.tags,
      deepWork: parsed.deepWork,
      list: "today",
      date,
      scheduledTime: parsed.start,
    })
    if (parsed.start && parsed.end) {
      const startMin = hhmmToMin(parsed.start)
      const endMin = hhmmToMin(parsed.end)
      createBox.mutate({
        title: parsed.title,
        start: isoFromDayMinutes(date, startMin),
        end: isoFromDayMinutes(date, Math.max(endMin, startMin + 15)),
        date,
        deepWork: parsed.deepWork,
        tags: parsed.tags,
        taskId: task.id,
      })
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (menuOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActive((i) => (i + 1) % items.length)
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setActive((i) => (i - 1 + items.length) % items.length)
        return
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        const s = items[clampedActive]
        if (s) applySuggestion(s)
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setDismissed(true)
        return
      }
    }
    if (e.key === "Enter") {
      e.preventDefault()
      void submit()
    } else if (e.key === "Escape") {
      inputRef.current?.blur()
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        disabled={readOnly}
        onChange={(e) => {
          setValue(e.target.value)
          setDismissed(false)
          syncCaret(e.target)
        }}
        onSelect={(e) => syncCaret(e.currentTarget)}
        onKeyUp={(e) => syncCaret(e.currentTarget)}
        onClick={(e) => syncCaret(e.currentTarget)}
        onKeyDown={onKeyDown}
        placeholder={
          readOnly
            ? "Read-only until your subscription is active"
            : "Add to-do — / for commands, #tag, -d deep work, @8am-9am"
        }
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-muted/40 pr-9 pl-3 text-sm shadow-[var(--sunken)] transition outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary/20",
          // Live deep-work feedback: the -d flag tints the field.
          parsed.deepWork &&
            "border-timebox-deep bg-timebox/5 ring-2 ring-timebox-deep/25 focus-visible:border-timebox-deep focus-visible:ring-timebox-deep/25"
        )}
      />
      {readOnly ? null : (
        <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          N
        </kbd>
      )}

      {/* live parse chips */}
      {!readOnly &&
      !menuOpen &&
      value.trim() &&
      (parsed.deepWork || parsed.tags.length > 0 || parsed.start) ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
          {parsed.deepWork ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-timebox/15 px-2 py-0.5 font-medium text-timebox-deep">
              <BrainIcon weight="fill" className="size-3" />
              Deep work
            </span>
          ) : null}
          {parsed.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 font-medium text-accent-foreground"
            >
              #{t}
            </span>
          ))}
          {parsed.start ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
              <ClockIcon className="size-3" />
              {parsed.start}
              {parsed.end ? `–${parsed.end}` : ""}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* "/" command + "@" time picker */}
      <TransitionDropdown
        open={menuOpen}
        origin="top-left"
        role="listbox"
        className="absolute top-full left-0 z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-[var(--elevation-high)]"
      >
        {trigger ? (
          <p className="px-2 py-1 text-[10px] font-medium tracking-wide text-muted-foreground/70 uppercase">
            {trigger.kind === "/" ? "Quick-add commands" : "Pick a time block"}
          </p>
        ) : null}
        {items.map((s, i) => (
          <button
            key={s.label}
            type="button"
            role="option"
            aria-selected={i === clampedActive}
            onMouseEnter={() => setActive(i)}
            onMouseDown={(e) => {
              e.preventDefault()
              applySuggestion(s)
            }}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
              i === clampedActive
                ? "bg-accent text-accent-foreground [&_svg]:text-accent-foreground"
                : "text-foreground"
            )}
          >
            {s.icon}
            <span className="flex-1">{s.label}</span>
            {s.hint ? (
              <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground">
                {s.hint}
              </kbd>
            ) : null}
          </button>
        ))}
      </TransitionDropdown>
    </div>
  )
}
