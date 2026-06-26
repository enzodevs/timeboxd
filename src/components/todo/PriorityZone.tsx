import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { PlusIcon, StarIcon } from "@phosphor-icons/react"

import type { Task } from "@/db/schema"
import { cn } from "@/lib/utils"
import { useTaskMutations } from "@/hooks/use-tasks"
import { TodoItem } from "./TodoItem"

const SLOTS = [0, 1, 2] as const

const slotBadge =
  "flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-[11px] font-semibold text-primary tabular-nums"

interface PriorityZoneProps {
  date: string
  /** Today's tasks already filtered to priorities (max 3, in slot order). */
  tasks: Task[]
  googleConnected?: boolean
  onViewInGoogle?: (task: Task) => void
  readOnly?: boolean
}

/** An empty slot: type a title to create a to-do already flagged as a priority. */
function EmptySlot({
  index,
  date,
  readOnly,
}: {
  index: number
  date: string
  readOnly?: boolean
}) {
  const { create } = useTaskMutations(date)
  const [value, setValue] = React.useState("")

  const submit = () => {
    const title = value.trim()
    if (!title) return
    setValue("")
    create.mutate({ title, list: "today", date, priority: true })
  }

  return (
    <li className="flex items-center gap-2 rounded-lg border border-dashed border-border/70 px-2.5 py-2 transition-colors focus-within:border-primary/50 focus-within:bg-card">
      <span aria-hidden className={cn(slotBadge, "bg-muted text-muted-foreground")}>
        {index + 1}
      </span>
      {/* Match the 20px checkbox column on filled rows so titles share an edge. */}
      <span className="flex size-5 shrink-0 items-center justify-center">
        <PlusIcon className="size-4 text-muted-foreground/50" />
      </span>
      <input
        value={value}
        disabled={readOnly}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            submit()
          }
        }}
        placeholder={readOnly ? "Read-only" : `Add priority #${index + 1}`}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed"
      />
    </li>
  )
}

export function PriorityZone({
  date,
  tasks,
  googleConnected,
  onViewInGoogle,
  readOnly,
}: PriorityZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "priority",
    data: { containerId: "priority" },
    disabled: readOnly,
  })

  const filled = tasks.slice(0, 3)

  // Read-only with nothing chosen: don't show an inviting-but-dead zone.
  if (readOnly && filled.length === 0) return null

  // Read-only shows only what's chosen; editing shows all 3 slots.
  const indices = readOnly ? filled.map((_, i) => i) : SLOTS

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 px-0.5">
        <StarIcon weight="fill" className="size-3.5 text-primary" />
        <h3 className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Top priorities
        </h3>
        <span className="ml-auto text-[11px] tabular-nums text-muted-foreground/70">
          {filled.length}/3
        </span>
      </div>

      <SortableContext
        id="priority"
        items={filled.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul
          ref={setNodeRef}
          className={cn(
            "flex flex-col gap-1.5 rounded-lg p-0.5 transition-colors",
            isOver && "bg-primary/5 ring-1 ring-primary/20 ring-inset"
          )}
        >
          {indices.map((i) => {
            const task = filled[i]
            return task ? (
              <TodoItem
                key={task.id}
                task={task}
                date={date}
                containerId="priority"
                slot={i + 1}
                googleConnected={googleConnected}
                onViewInGoogle={onViewInGoogle}
                readOnly={readOnly}
              />
            ) : (
              <EmptySlot
                key={`empty-${i}`}
                index={i}
                date={date}
                readOnly={readOnly}
              />
            )
          })}
        </ul>
      </SortableContext>
    </section>
  )
}
