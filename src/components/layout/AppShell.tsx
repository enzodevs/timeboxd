import * as React from "react"
import { addDays } from "date-fns"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import {
  ListChecksIcon,
  CalendarBlankIcon,
  NotePencilIcon,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Task, Timebox } from "@/db/schema"
import type { AccessState } from "@/server/billing"
import { CALENDAR_DROPPABLE } from "@/lib/dnd"
import {
  DAY_MINUTES,
  PX_PER_HOUR,
  isoFromDayMinutes,
  parseYmd,
  snap,
  ymd,
} from "@/lib/time"
import { setTasksCache, tasksKey, useTaskMutations } from "@/hooks/use-tasks"
import type { TaskLists } from "@/server/tasks"
import { useTimeboxMutations } from "@/hooks/use-timeboxes"
import { useGoogleActions, useGoogleStatus } from "@/hooks/use-google"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { TodoPanel } from "@/components/todo/TodoPanel"
import { TodoLaterPanel } from "@/components/todo/TodoLaterPanel"
import { CalendarColumn } from "@/components/calendar/CalendarColumn"
import { NotesPanel } from "@/components/notes/NotesPanel"
import { SettingsDialog } from "@/components/settings/SettingsDialog"
import { TopBar } from "@/components/layout/TopBar"
import { CommandPalette } from "@/components/search/CommandPalette"
import { BorderBeam } from "@/components/magicui/border-beam"

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v))

const MOBILE_TABS = [
  { id: "todo", label: "To-dos", Icon: ListChecksIcon },
  { id: "timeline", label: "Timeline", Icon: CalendarBlankIcon },
  { id: "notes", label: "Notes", Icon: NotePencilIcon },
] as const

export function AppShell({ access }: { access: AccessState }) {
  const qc = useQueryClient()
  const [date, setDate] = React.useState(() => ymd(new Date()))
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [activeTask, setActiveTask] = React.useState<Task | null>(null)
  const gridRef = React.useRef<HTMLDivElement | null>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [mobilePane, setMobilePane] = React.useState<
    "todo" | "timeline" | "notes"
  >("timeline")

  const { reorder } = useTaskMutations(date)
  const { create: createBox } = useTimeboxMutations(date)
  const { data: google } = useGoogleStatus()
  const { pushTimebox } = useGoogleActions()
  const googleConnected = Boolean(google?.connected)
  const readOnly = !access.hasActiveAccess

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  // Surface the OAuth round-trip result and clean the URL.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const g = params.get("google")
    if (g === "connected") {
      toast.success("Google connected")
      void qc.invalidateQueries({ queryKey: ["google"] })
    } else if (g === "error") {
      toast.error("Google connection failed")
    } else if (g === "subscription") {
      toast.error("An active subscription is required for Google sync")
    }
    if (g) window.history.replaceState({}, "", window.location.pathname)
  }, [qc])

  const goPrev = () => setDate((d) => ymd(addDays(parseYmd(d), -1)))
  const goNext = () => setDate((d) => ymd(addDays(parseYmd(d), 1)))
  const goToday = () => setDate(ymd(new Date()))

  // Arrow-key day navigation when not typing in a field.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
      const el = document.activeElement
      const tag = el?.tagName
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (el as HTMLElement | null)?.isContentEditable
      )
        return
      e.preventDefault()
      if (e.key === "ArrowLeft") goPrev()
      else goNext()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const onDragStart = (e: DragStartEvent) => {
    const lists = qc.getQueryData<TaskLists>(tasksKey(date))
    const id = String(e.active.id)
    const task =
      lists?.today.find((t) => t.id === id) ??
      lists?.later.find((t) => t.id === id) ??
      null
    setActiveTask(task)
  }

  const createTimeboxFromDrop = (task: Task, e: DragEndEvent) => {
    if (readOnly) {
      toast.error("Upgrade to edit your workspace")
      return
    }
    const rect = gridRef.current?.getBoundingClientRect()
    let minutes = new Date().getHours() * 60
    if (rect) {
      const top = e.active.rect.current.translated?.top ?? rect.top
      minutes = clamp(
        snap(((top - rect.top) / PX_PER_HOUR) * 60),
        0,
        DAY_MINUTES - 15
      )
    }
    const dur = task.estimateMin ?? 60
    createBox.mutate({
      title: task.title,
      start: isoFromDayMinutes(date, minutes),
      end: isoFromDayMinutes(date, Math.min(minutes + dur, DAY_MINUTES)),
      date,
      deepWork: task.deepWork,
      tags: task.tags,
      taskId: task.id,
    })
  }

  const onDragEnd = (e: DragEndEvent) => {
    setActiveTask(null)
    if (readOnly) return
    const { active, over } = e
    if (!over) return

    const lists = qc.getQueryData<TaskLists>(tasksKey(date))
    if (!lists) return
    const id = String(active.id)

    const task =
      lists.today.find((t) => t.id === id) ??
      lists.later.find((t) => t.id === id)
    if (!task) return

    if (over.id === CALENDAR_DROPPABLE) {
      createTimeboxFromDrop(task, e)
      return
    }

    // Three logical buckets: the day's priorities, the rest of "today" (the
    // brain dump), and the undated "later" backlog. Priorities are a subset of
    // "today" (priority flag), so promote/demote is just moving between buckets.
    const prio = lists.today.filter((t) => t.priority)
    const rest = lists.today.filter((t) => !t.priority)
    const later = [...lists.later]
    const buckets = { priority: prio, today: rest, later } as const
    type Bucket = keyof typeof buckets
    const bucketOf = (taskId: string): Bucket | null =>
      prio.some((t) => t.id === taskId)
        ? "priority"
        : rest.some((t) => t.id === taskId)
          ? "today"
          : later.some((t) => t.id === taskId)
            ? "later"
            : null

    const source = bucketOf(id)
    if (!source) return

    const overId = String(over.id)
    const isContainer =
      overId === "priority" || overId === "today" || overId === "later"
    const target: Bucket = isContainer
      ? overId
      : (bucketOf(overId) ?? source)

    // Promotion is capped at 3 — refuse the drop and leave things as they were.
    if (target === "priority" && source !== "priority" && prio.length >= 3) {
      toast("Only 3 top priorities — demote one first")
      return
    }

    const srcArr = buckets[source]
    const tgtArr = buckets[target]
    const fromIdx = srcArr.findIndex((t) => t.id === id)
    const [moved] = srcArr.splice(fromIdx, 1)
    if (!moved) return
    const updated: Task = {
      ...moved,
      priority: target === "priority",
      list: target === "later" ? "later" : "today",
      date: target === "later" ? null : date,
    }
    let toIdx = isContainer
      ? tgtArr.length
      : tgtArr.findIndex((t) => t.id === overId)
    if (toIdx < 0) toIdx = tgtArr.length
    tgtArr.splice(toIdx, 0, updated)

    // Rebuild "today" with priorities first so slot order is stable.
    const today = [...prio, ...rest]
    setTasksCache(qc, date, { today, later })
    reorder.mutate([
      ...today.map((t, i) => ({
        id: t.id,
        sortOrder: i,
        list: "today" as const,
        date,
        priority: t.priority,
      })),
      ...later.map((t, i) => ({
        id: t.id,
        sortOrder: i,
        list: "later" as const,
        date: null,
        priority: false,
      })),
    ])
  }

  const viewTaskInGoogle = () => {
    const d = parseYmd(date)
    window.open(
      `https://calendar.google.com/calendar/u/0/r/day/${d.getFullYear()}/${
        d.getMonth() + 1
      }/${d.getDate()}`,
      "_blank"
    )
  }

  const viewBoxInGoogle = (box: Timebox) => {
    if (readOnly) {
      toast.error("An active subscription is required for Google sync")
      return
    }
    toast.promise(
      pushTimebox.mutateAsync(box.id).then((r) => {
        if (r.htmlLink) window.open(r.htmlLink, "_blank")
        return r
      }),
      {
        loading: "Opening in Google Calendar…",
        success: "Synced to Google Calendar",
        error: "Could not sync to Google",
      }
    )
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background text-foreground">
      <TopBar
        date={date}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        onGoToDate={setDate}
        onOpenSettings={() => setSettingsOpen(true)}
        googleConnected={googleConnected}
      />

      {readOnly ? (
        <div className="bg-background px-3 pt-3">
          <div className="tb-card relative overflow-hidden rounded-lg border border-primary/30 bg-card px-3 py-2.5 shadow-[var(--elevation-low)]">
            <BorderBeam duration={9} borderWidth={1.5} />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">Read-only access</span>
              <span className="text-muted-foreground">
                Your data is safe. Upgrade to create, edit, and sync again.
              </span>
              <Link
                to="/pricing"
                className="ml-auto rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/80"
              >
                Upgrade
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={readOnly ? undefined : onDragStart}
        onDragEnd={readOnly ? undefined : onDragEnd}
      >
        {isDesktop ? (
          <ResizablePanelGroup orientation="horizontal" className="flex-1">
            <ResizablePanel
              defaultSize="27%"
              minSize="260px"
              className="min-w-0"
            >
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize="62%" minSize="160px">
                  <TodoPanel
                    date={date}
                    googleConnected={googleConnected}
                    onViewInGoogle={viewTaskInGoogle}
                    readOnly={readOnly}
                  />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize="38%" minSize="120px">
                  <TodoLaterPanel
                    date={date}
                    googleConnected={googleConnected}
                    onViewInGoogle={viewTaskInGoogle}
                    readOnly={readOnly}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel
              defaultSize="45%"
              minSize="420px"
              className="min-w-0"
            >
              <CalendarColumn
                date={date}
                gridRef={gridRef}
                googleConnected={googleConnected}
                onViewInGoogle={viewBoxInGoogle}
                readOnly={readOnly}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel
              defaultSize="28%"
              minSize="280px"
              className="min-w-0"
            >
              <NotesPanel date={date} readOnly={readOnly} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          /* Mobile: one pane at a time, switched by the bottom tab bar. Only
             the active pane is mounted so dnd-kit droppable ids stay unique. */
          <div className="min-h-0 flex-1">
            {mobilePane === "todo" ? (
              <div className="flex h-full min-h-0 flex-col divide-y divide-border">
                <div className="min-h-0 flex-1">
                  <TodoPanel
                    date={date}
                    googleConnected={googleConnected}
                    onViewInGoogle={viewTaskInGoogle}
                    readOnly={readOnly}
                  />
                </div>
                <div className="min-h-0 flex-1">
                  <TodoLaterPanel
                    date={date}
                    googleConnected={googleConnected}
                    onViewInGoogle={viewTaskInGoogle}
                    readOnly={readOnly}
                  />
                </div>
              </div>
            ) : mobilePane === "timeline" ? (
              <CalendarColumn
                date={date}
                gridRef={gridRef}
                googleConnected={googleConnected}
                onViewInGoogle={viewBoxInGoogle}
                readOnly={readOnly}
              />
            ) : (
              <NotesPanel date={date} readOnly={readOnly} />
            )}
          </div>
        )}

        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-sm shadow-lg">
              <span className="truncate">{activeTask.title}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {!isDesktop ? (
        <nav
          aria-label="Panels"
          className="flex shrink-0 items-stretch gap-1 border-t border-border bg-background/95 px-2 pt-1.5 backdrop-blur"
          style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
        >
          {MOBILE_TABS.map(({ id, label, Icon }) => {
            const active = mobilePane === id
            return (
              <button
                key={id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => setMobilePane(id)}
                className={cn(
                  "group/tab relative flex min-h-14 flex-1 touch-manipulation flex-col items-center justify-center rounded-xl text-[11px] font-medium transition-transform outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.94]",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active pill — sits behind the icon + label. */}
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-x-2 inset-y-1 rounded-xl bg-primary/10 transition-opacity duration-200",
                    active ? "opacity-100" : "opacity-0"
                  )}
                />
                {/* Top accent line on the active tab. */}
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute top-0 h-0.5 w-7 rounded-full bg-primary transition-opacity duration-200",
                    active ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="relative flex flex-col items-center gap-1">
                  <Icon
                    className="size-5 transition-transform group-active/tab:scale-90"
                    weight={active ? "fill" : "regular"}
                  />
                  {label}
                </span>
              </button>
            )
          })}
        </nav>
      ) : null}

      <CommandPalette
        date={date}
        onGoToDate={setDate}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        readOnly={readOnly}
      />
    </div>
  )
}
