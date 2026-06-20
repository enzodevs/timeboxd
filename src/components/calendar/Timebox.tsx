import * as React from "react"
import { addDays } from "date-fns"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BrainIcon,
  CheckCircleIcon,
  CircleIcon,
  CopyIcon,
  DotsThreeIcon,
  GoogleLogoIcon,
  TagIcon,
  TrashIcon,
} from "@phosphor-icons/react"

import type { Timebox as TimeboxRow } from "@/db/schema"
import { cn } from "@/lib/utils"
import {
  DAY_MINUTES,
  formatClock,
  isoFromDayMinutes,
  minutesOfDay,
  parseYmd,
  snap,
  ymd,
} from "@/lib/time"
import { useTimeboxMutations } from "@/hooks/use-timeboxes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddTagDialog } from "@/components/todo/AddTagDialog"

const MIN_DURATION = 15
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v))

type DragMode = "move" | "top" | "bottom"

interface TimeboxProps {
  box: TimeboxRow
  date: string
  pxPerHour: number
  col: number
  cols: number
  googleConnected?: boolean
  onViewInGoogle?: (box: TimeboxRow) => void
}

export function Timebox({
  box,
  date,
  pxPerHour,
  col,
  cols,
  googleConnected,
  onViewInGoogle,
}: TimeboxProps) {
  const { update, remove, create } = useTimeboxMutations(date)
  const [draft, setDraft] = React.useState<{
    start: number
    end: number
  } | null>(null)
  const [editing, setEditing] = React.useState(false)
  const [title, setTitle] = React.useState(box.title)
  const [tagOpen, setTagOpen] = React.useState(false)
  const draggedRef = React.useRef(false)

  const startMin = draft ? draft.start : minutesOfDay(box.start)
  const endMin = draft ? draft.end : minutesOfDay(box.end)
  const top = (startMin / 60) * pxPerHour
  const height = Math.max(((endMin - startMin) / 60) * pxPerHour, 22)
  const compact = height < 44

  const beginDrag = (mode: DragMode) => (e: React.PointerEvent) => {
    if (e.button !== 0 || editing) return
    e.preventDefault()
    e.stopPropagation()
    draggedRef.current = false
    const startY = e.clientY
    const origStart = minutesOfDay(box.start)
    const origEnd = minutesOfDay(box.end)

    const onMove = (ev: PointerEvent) => {
      const delta = ((ev.clientY - startY) / pxPerHour) * 60
      if (Math.abs(ev.clientY - startY) > 3) draggedRef.current = true
      let ns = origStart
      let ne = origEnd
      if (mode === "move") {
        const d = snap(delta)
        ns = origStart + d
        ne = origEnd + d
        if (ns < 0) {
          ne -= ns
          ns = 0
        }
        if (ne > DAY_MINUTES) {
          ns -= ne - DAY_MINUTES
          ne = DAY_MINUTES
        }
      } else if (mode === "top") {
        ns = clamp(snap(origStart + delta), 0, origEnd - MIN_DURATION)
      } else {
        ne = clamp(snap(origEnd + delta), origStart + MIN_DURATION, DAY_MINUTES)
      }
      setDraft({ start: ns, end: ne })
    }

    const onUp = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      setDraft((d) => {
        if (d && (d.start !== origStart || d.end !== origEnd)) {
          update.mutate({
            id: box.id,
            patch: {
              start: isoFromDayMinutes(box.date, d.start),
              end: isoFromDayMinutes(box.date, d.end),
            },
          })
        }
        return null
      })
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  const saveTitle = () => {
    setEditing(false)
    const t = title.trim()
    if (t && t !== box.title) update.mutate({ id: box.id, patch: { title: t } })
    else setTitle(box.title)
  }

  const moveDay = (delta: number) => {
    const newDate = ymd(addDays(parseYmd(box.date), delta))
    update.mutate({
      id: box.id,
      patch: {
        date: newDate,
        start: isoFromDayMinutes(newDate, minutesOfDay(box.start)),
        end: isoFromDayMinutes(newDate, minutesOfDay(box.end)),
      },
    })
  }

  const deep = box.deepWork

  return (
    <div
      className={cn(
        "group/box absolute overflow-hidden rounded-lg px-2 py-1 text-left text-timebox-foreground shadow-sm ring-1 ring-black/5 transition-shadow select-none",
        deep ? "bg-timebox-deep" : "bg-timebox",
        draft
          ? "z-30 cursor-grabbing shadow-lg"
          : "cursor-grab hover:shadow-md",
        box.completed && "opacity-70"
      )}
      style={{
        top,
        height,
        left: `calc(${(100 / cols) * col}% + 2px)`,
        width: `calc(${100 / cols}% - 4px)`,
      }}
      onPointerDown={beginDrag("move")}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setEditing(true)
      }}
    >
      {/* top resize handle */}
      <div
        onPointerDown={beginDrag("top")}
        className="absolute inset-x-0 top-0 z-10 h-1.5 cursor-ns-resize"
      >
        <div className="mx-auto mt-0.5 h-0.5 w-6 rounded-full bg-white/0 transition-colors group-hover/box:bg-white/50" />
      </div>

      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "flex items-center gap-1 text-[10px] leading-tight text-timebox-foreground/85",
              compact && "text-[9px]"
            )}
          >
            {deep && <BrainIcon weight="fill" className="size-3 shrink-0" />}
            <span className="truncate">
              {formatClock(startMin)} - {formatClock(endMin)}
            </span>
          </div>
          {editing ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle()
                if (e.key === "Escape") {
                  setTitle(box.title)
                  setEditing(false)
                }
              }}
              className="mt-0.5 w-full rounded bg-white/20 px-1 text-sm font-medium text-white outline-none placeholder:text-white/60"
            />
          ) : (
            <div
              className={cn(
                "mt-0.5 truncate text-sm font-medium",
                box.completed && "line-through",
                compact && "mt-0 text-xs"
              )}
            >
              {box.title}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover/box:opacity-100">
          <button
            type="button"
            aria-label={box.completed ? "Mark as not done" : "Mark as done"}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() =>
              update.mutate({
                id: box.id,
                patch: { completed: !box.completed },
              })
            }
            className="flex size-5 items-center justify-center rounded text-white/90 hover:bg-white/20"
          >
            {box.completed ? (
              <CheckCircleIcon weight="fill" className="size-4" />
            ) : (
              <CircleIcon className="size-4" />
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Timebox actions"
                onPointerDown={(e) => e.stopPropagation()}
                className="flex size-5 items-center justify-center rounded text-white/90 hover:bg-white/20"
              >
                <DotsThreeIcon weight="bold" className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onSelect={() =>
                  update.mutate({
                    id: box.id,
                    patch: { completed: !box.completed },
                  })
                }
              >
                <CheckCircleIcon />
                {box.completed ? "Mark as not done" : "Mark as done"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  update.mutate({
                    id: box.id,
                    patch: { deepWork: !box.deepWork },
                  })
                }
              >
                <BrainIcon />
                {box.deepWork ? "Unmark deep work" : "Mark as deep work"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  create.mutate({
                    title: box.title,
                    start: box.start,
                    end: box.end,
                    date: box.date,
                    deepWork: box.deepWork,
                    tags: box.tags,
                  })
                }
              >
                <CopyIcon />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ArrowRightIcon />
                  Move to
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onSelect={() => moveDay(-1)}>
                    <ArrowLeftIcon />
                    Previous day
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => moveDay(1)}>
                    <ArrowRightIcon />
                    Next day
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem
                disabled={!googleConnected}
                onSelect={() => onViewInGoogle?.(box)}
              >
                <GoogleLogoIcon />
                View in Calendar
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTagOpen(true)}>
                <TagIcon />
                Add tag
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => remove.mutate(box.id)}
              >
                <TrashIcon />
                Delete timebox
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {box.tags.length > 0 && !compact && (
        <div className="mt-1 flex flex-wrap gap-1">
          {box.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-white/20 px-1.5 text-[10px] font-medium"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* bottom resize handle */}
      <div
        onPointerDown={beginDrag("bottom")}
        className="absolute inset-x-0 bottom-0 z-10 h-1.5 cursor-ns-resize"
      >
        <div className="mx-auto h-0.5 w-6 rounded-full bg-white/0 transition-colors group-hover/box:bg-white/50" />
      </div>

      <AddTagDialog
        open={tagOpen}
        onOpenChange={setTagOpen}
        existing={box.tags}
        onAdd={(tags) => update.mutate({ id: box.id, patch: { tags } })}
      />
    </div>
  )
}
