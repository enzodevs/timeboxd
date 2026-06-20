import * as React from "react"

import { parseTaskInput } from "@/lib/parse-task"
import { isoFromDayMinutes } from "@/lib/time"
import { useTaskMutations } from "@/hooks/use-tasks"
import { useTimeboxMutations } from "@/hooks/use-timeboxes"

function hhmmToMin(hhmm: string): number {
  const [h = 0, m = 0] = hhmm.split(":").map(Number)
  return h * 60 + m
}

export function TodoInput({ date }: { date: string }) {
  const [value, setValue] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { create } = useTaskMutations(date)
  const { create: createBox } = useTimeboxMutations(date)

  // Global "N" shortcut focuses the quick-add field.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
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
      inputRef.current?.focus()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const submit = async () => {
    const parsed = parseTaskInput(value)
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

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            void submit()
          } else if (e.key === "Escape") {
            inputRef.current?.blur()
          }
        }}
        placeholder="Add to-do, #tag, -d for deep work, @8am-9am for time"
        className="h-10 w-full rounded-lg border border-border bg-card pr-9 pl-3 text-sm shadow-xs transition outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
        N
      </kbd>
    </div>
  )
}
