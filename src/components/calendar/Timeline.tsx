import * as React from "react"
import { useDndMonitor, useDroppable } from "@dnd-kit/core"
import { useQueryClient } from "@tanstack/react-query"

import type { Timebox as TimeboxRow } from "@/db/schema"
import { CALENDAR_DROPPABLE } from "@/lib/dnd"
import {
  DAY_MINUTES,
  DEFAULT_BOX_MIN,
  PX_PER_HOUR,
  formatClock,
  formatHourLabel,
  isoFromDayMinutes,
  layoutIntervals,
  minutesOfDay,
  snap,
  ymd,
} from "@/lib/time"
import { tasksKey } from "@/hooks/use-tasks"
import type { TaskLists } from "@/server/tasks"
import { useTimeboxes, useTimeboxMutations } from "@/hooks/use-timeboxes"
import { useGoogleEvents } from "@/hooks/use-google"
import { Timebox } from "./Timebox"
import { NowIndicator } from "./NowIndicator"

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v))
const GUTTER = 56

interface TimelineProps {
  date: string
  gridRef: React.RefObject<HTMLDivElement | null>
  googleConnected?: boolean
  onViewInGoogle?: (box: TimeboxRow) => void
  readOnly?: boolean
}

export function Timeline({
  date,
  gridRef,
  googleConnected,
  onViewInGoogle,
  readOnly,
}: TimelineProps) {
  const { data: boxes = [] } = useTimeboxes(date)
  const { data: external = [] } = useGoogleEvents(
    date,
    Boolean(googleConnected)
  )
  const { create } = useTimeboxMutations(date)
  const qc = useQueryClient()
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const { setNodeRef } = useDroppable({
    id: CALENDAR_DROPPABLE,
    disabled: readOnly,
  })
  const isToday = date === ymd(new Date())

  const setGridRef = (node: HTMLDivElement | null) => {
    setNodeRef(node)
    gridRef.current = node
  }

  // Live "where will this land" preview while dragging a to-do over the grid.
  const dragged = React.useRef<{ dur: number; label: string } | null>(null)
  const [preview, setPreview] = React.useState<{
    start: number
    end: number
    label: string
  } | null>(null)

  const previewFromTop = (clientTop: number | undefined) => {
    if (readOnly || !dragged.current || clientTop == null) return null
    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect) return null
    const start = clamp(
      snap(((clientTop - rect.top) / PX_PER_HOUR) * 60),
      0,
      DAY_MINUTES - 15
    )
    const end = Math.min(start + dragged.current.dur, DAY_MINUTES)
    return { start, end, label: dragged.current.label }
  }

  useDndMonitor({
    onDragStart(e) {
      if (readOnly) return
      const lists = qc.getQueryData<TaskLists>(tasksKey(date))
      const id = String(e.active.id)
      const task =
        lists?.today.find((t) => t.id === id) ??
        lists?.later.find((t) => t.id === id) ??
        null
      dragged.current = task
        ? { dur: task.estimateMin ?? DEFAULT_BOX_MIN, label: task.title }
        : null
    },
    onDragMove(e) {
      if (e.over?.id !== CALENDAR_DROPPABLE) {
        setPreview(null)
        return
      }
      setPreview(previewFromTop(e.active.rect.current.translated?.top))
    },
    onDragEnd() {
      dragged.current = null
      setPreview(null)
    },
    onDragCancel() {
      dragged.current = null
      setPreview(null)
    },
  })

  // Auto-scroll to "now" (or the morning) when the day changes.
  const scrolledFor = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (scrolledFor.current === date) return
    const el = scrollRef.current
    if (!el) return
    scrolledFor.current = date
    const now = new Date()
    const focusMin = isToday ? now.getHours() * 60 + now.getMinutes() : 8 * 60
    el.scrollTop = Math.max(
      0,
      (focusMin / 60) * PX_PER_HOUR - el.clientHeight / 3
    )
  }, [date, isToday])

  const positioned = layoutIntervals(
    boxes.map((b) => ({
      box: b,
      start: minutesOfDay(b.start),
      end: minutesOfDay(b.end),
    }))
  )

  const createAt = (clientY: number) => {
    if (readOnly) return
    const rect = gridRef.current?.getBoundingClientRect()
    if (!rect) return
    const min = clamp(
      snap(((clientY - rect.top) / PX_PER_HOUR) * 60),
      0,
      DAY_MINUTES - 60
    )
    create.mutate({
      title: "New timebox",
      start: isoFromDayMinutes(date, min),
      end: isoFromDayMinutes(date, min + 60),
      date,
    })
  }

  return (
    <div
      ref={scrollRef}
      className="relative no-scrollbar min-h-0 flex-1 overflow-y-auto pt-3 pb-16"
    >
      <div
        className="relative"
        style={{ height: DAY_MINUTES * (PX_PER_HOUR / 60) }}
      >
        {/* hour grid lines + labels */}
        {Array.from({ length: 24 }, (_, h) => (
          <div
            key={h}
            className="absolute right-0 left-0 border-t border-border/70"
            style={{ top: h * PX_PER_HOUR }}
          >
            <span className="absolute -top-2 left-0 w-12 pr-2 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
              {h === 0 ? "" : formatHourLabel(h)}
            </span>
          </div>
        ))}

        {/* content / droppable layer offset past the gutter */}
        <div
          ref={setGridRef}
          className="absolute top-0 right-3 bottom-0"
          style={{ left: GUTTER }}
          onDoubleClick={readOnly ? undefined : (e) => createAt(e.clientY)}
        >
          {/* read-only Google Calendar events underlay */}
          {external.map((ev) => {
            const s = minutesOfDay(ev.start)
            const e = minutesOfDay(ev.end)
            return (
              <a
                key={ev.id}
                href={ev.htmlLink ?? undefined}
                target="_blank"
                rel="noreferrer"
                title={`${ev.title} (Google Calendar)`}
                className="absolute right-0 left-0 z-0 overflow-hidden rounded-md border border-dashed border-muted-foreground/30 bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground"
                style={{
                  top: (s / 60) * PX_PER_HOUR,
                  height: Math.max(((e - s) / 60) * PX_PER_HOUR, 16),
                }}
              >
                <span className="truncate">{ev.title}</span>
              </a>
            )
          })}
          {positioned.map((p) => (
            <Timebox
              key={p.item.box.id}
              box={p.item.box}
              date={date}
              pxPerHour={PX_PER_HOUR}
              col={p.col}
              cols={p.cols}
              googleConnected={googleConnected}
              onViewInGoogle={onViewInGoogle}
              readOnly={readOnly}
            />
          ))}
          {/* drop-placement preview */}
          {preview && (
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 left-0 z-40 flex flex-col justify-start overflow-hidden rounded-lg border border-dashed border-primary/70 bg-primary/10 px-3 py-1 text-left"
              style={{
                top: (preview.start / 60) * PX_PER_HOUR,
                height: Math.max(
                  ((preview.end - preview.start) / 60) * PX_PER_HOUR,
                  22
                ),
              }}
            >
              <span className="text-[10px] leading-tight font-medium text-primary tabular-nums">
                {formatClock(preview.start)} - {formatClock(preview.end)}
              </span>
              <span className="truncate text-sm font-medium text-primary/90">
                {preview.label}
              </span>
            </div>
          )}
          {isToday && <NowIndicator pxPerHour={PX_PER_HOUR} />}
        </div>
      </div>
    </div>
  )
}
