import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ArrowSquareOutIcon,
  BrainIcon,
  CalendarPlusIcon,
  CheckCircleIcon,
  CopyIcon,
  DotsThreeIcon,
  GoogleLogoIcon,
  TagIcon,
  TrashIcon,
} from "@phosphor-icons/react"

import type { Task } from "@/db/schema"
import { cn } from "@/lib/utils"
import { formatClock, isoFromDayMinutes } from "@/lib/time"
import { SuccessCheck } from "@/components/ui/success-check"
import { useTaskMutations } from "@/hooks/use-tasks"
import { useTimeboxMutations } from "@/hooks/use-timeboxes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import type { MenuParts } from "@/components/ui/context-menu"
import { CONTEXT_PARTS, DROPDOWN_PARTS } from "@/lib/menu-parts"
import { AddTagDialog } from "./AddTagDialog"

function formatScheduled(hhmm: string): string {
  const [h = 0, m = 0] = hhmm.split(":").map(Number)
  return formatClock(h * 60 + m)
}

export function TagChip({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
      #{tag}
    </span>
  )
}

interface TodoItemProps {
  task: Task
  date: string
  containerId: "today" | "later"
  googleConnected?: boolean
  onViewInGoogle?: (task: Task) => void
  readOnly?: boolean
}

export function TodoItem({
  task,
  date,
  googleConnected,
  onViewInGoogle,
  readOnly,
}: TodoItemProps) {
  const { update, remove, create } = useTaskMutations(date)
  const { create: createBox } = useTimeboxMutations(date)
  const [tagOpen, setTagOpen] = React.useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { containerId: task.list },
    disabled: readOnly,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const toggleDone = () => {
    if (readOnly) return
    update.mutate({ id: task.id, patch: { completed: !task.completed } })
  }

  const addToCalendar = () => {
    if (readOnly) return
    const startMin = task.scheduledTime
      ? Number(task.scheduledTime.split(":")[0]) * 60 +
        Number(task.scheduledTime.split(":")[1])
      : Math.max(0, new Date().getHours()) * 60
    const dur = task.estimateMin ?? 60
    createBox.mutate({
      title: task.title,
      start: isoFromDayMinutes(task.date ?? date, startMin),
      end: isoFromDayMinutes(task.date ?? date, startMin + dur),
      date: task.date ?? date,
      deepWork: task.deepWork,
      tags: task.tags,
      taskId: task.id,
    })
  }

  const duplicate = () => {
    if (readOnly) return
    create.mutate({
      title: task.title,
      tags: task.tags,
      deepWork: task.deepWork,
      list: task.list as "today" | "later",
      date: task.date,
      scheduledTime: task.scheduledTime,
      estimateMin: task.estimateMin,
    })
  }

  // Shared by the ⋯ dropdown and the right-click context menu.
  const menuItems = (M: MenuParts) => {
    if (readOnly) {
      return (
        <>
          <M.Item disabled>Read-only mode</M.Item>
          <M.Item
            disabled={!googleConnected}
            onSelect={() => onViewInGoogle?.(task)}
          >
            <GoogleLogoIcon />
            View in Calendar
          </M.Item>
        </>
      )
    }
    return (
      <>
        <M.Item onSelect={toggleDone}>
          <CheckCircleIcon />
          {task.completed ? "Mark as not done" : "Mark as done"}
        </M.Item>
        <M.Item
          onSelect={() =>
            update.mutate({ id: task.id, patch: { deepWork: !task.deepWork } })
          }
        >
          <BrainIcon />
          {task.deepWork ? "Unmark deep work" : "Mark as deep work"}
        </M.Item>
        <M.Item onSelect={duplicate}>
          <CopyIcon />
          Duplicate to-do
        </M.Item>
        <M.Sub>
          <M.SubTrigger>
            <ArrowSquareOutIcon />
            Move to
          </M.SubTrigger>
          <M.SubContent>
            <M.Item
              onSelect={() =>
                update.mutate({
                  id: task.id,
                  patch: { list: "today", date, sortOrder: Date.now() },
                })
              }
            >
              Today
            </M.Item>
            <M.Item
              onSelect={() =>
                update.mutate({
                  id: task.id,
                  patch: { list: "later", date: null, sortOrder: Date.now() },
                })
              }
            >
              To-do Later
            </M.Item>
          </M.SubContent>
        </M.Sub>
        <M.Item onSelect={addToCalendar}>
          <CalendarPlusIcon />
          Add to calendar
        </M.Item>
        <M.Item
          disabled={!googleConnected}
          onSelect={() => onViewInGoogle?.(task)}
        >
          <GoogleLogoIcon />
          View in Calendar
        </M.Item>
        <M.Item onSelect={() => setTagOpen(true)}>
          <TagIcon />
          Add tag
        </M.Item>
        <M.Separator />
        <M.Item variant="destructive" onSelect={() => remove.mutate(task.id)}>
          <TrashIcon />
          Delete to-do
        </M.Item>
      </>
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <li
          ref={setNodeRef}
          style={style}
          className={cn(
            "group/item flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 shadow-[var(--elevation-low)] transition-shadow",
            isDragging && "z-10 opacity-60 shadow-[var(--elevation-high)]"
          )}
        >
          <button
            type="button"
            disabled={readOnly}
            onClick={toggleDone}
            aria-label={task.completed ? "Mark as not done" : "Mark as done"}
            className={cn(
              "shrink-0 text-muted-foreground/60 transition-colors hover:text-primary disabled:pointer-events-none",
              task.completed && "text-primary"
            )}
          >
            <SuccessCheck checked={task.completed} className="size-5" />
          </button>

          <div
            {...(readOnly ? {} : attributes)}
            {...(readOnly ? {} : listeners)}
            className={cn(
              "min-w-0 flex-1",
              readOnly ? "cursor-default" : "cursor-grab active:cursor-grabbing"
            )}
          >
            <div className="flex items-center gap-1.5">
              {task.deepWork && (
                <BrainIcon
                  weight="fill"
                  className="size-3.5 shrink-0 text-primary"
                />
              )}
              <span
                className={cn(
                  "truncate text-sm",
                  task.completed && "text-muted-foreground line-through"
                )}
              >
                {task.title}
              </span>
            </div>
            {task.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {task.tags.map((t) => (
                  <TagChip key={t} tag={t} />
                ))}
              </div>
            )}
          </div>

          {task.scheduledTime && (
            <span className="shrink-0 rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
              {formatScheduled(task.scheduledTime)}
            </span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="To-do actions"
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition group-hover/item:opacity-100 hover:bg-muted hover:text-foreground aria-expanded:opacity-100"
              >
                <DotsThreeIcon weight="bold" className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {menuItems(DROPDOWN_PARTS)}
            </DropdownMenuContent>
          </DropdownMenu>

          {readOnly ? null : (
            <AddTagDialog
              open={tagOpen}
              onOpenChange={setTagOpen}
              existing={task.tags}
              onAdd={(tags) => update.mutate({ id: task.id, patch: { tags } })}
            />
          )}
        </li>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        {menuItems(CONTEXT_PARTS)}
      </ContextMenuContent>
    </ContextMenu>
  )
}
