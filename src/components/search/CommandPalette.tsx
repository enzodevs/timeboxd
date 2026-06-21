import * as React from "react"
import { format } from "date-fns"
import {
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckSquareIcon,
  ClockIcon,
  GearSixIcon,
  NoteIcon,
  PlusIcon,
} from "@phosphor-icons/react"

import { formatRange, parseYmd } from "@/lib/time"
import { cn } from "@/lib/utils"
import { useSearch } from "@/hooks/use-search"
import type { SearchHit } from "@/server/search"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

/** Open the palette from anywhere (e.g. the top-bar search button). */
export const OPEN_SEARCH_EVENT = "timeboxd:open-search"
/** Focus the quick-add task field (palette "New task" action). */
export const FOCUS_NEW_TASK_EVENT = "timeboxd:focus-new-task"

interface CommandPaletteProps {
  date: string
  onGoToDate: (date: string) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onOpenSettings: () => void
}

export function CommandPalette({
  date,
  onGoToDate,
  onPrev,
  onNext,
  onToday,
  onOpenSettings,
}: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [debounced, setDebounced] = React.useState("")

  // Toggle on ⌘K / Ctrl+K; open on the custom event (top-bar search button).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener("keydown", onKey)
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen)
    }
  }, [])

  // Debounce the query that feeds the search request.
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 140)
    return () => clearTimeout(t)
  }, [query])

  const q = debounced.trim()
  const { data, isFetching } = useSearch(open ? q : "")

  const change = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setQuery("")
      setDebounced("")
    }
  }

  const run = (fn: () => void) => {
    fn()
    change(false)
  }

  const goToHit = (hit: SearchHit) => {
    if (hit.date) onGoToDate(hit.date)
    change(false)
  }

  const dayLabel = (d: string) => format(parseYmd(d), "EEE, MMM d")

  return (
    <CommandDialog
      open={open}
      onOpenChange={change}
      className="sm:max-w-xl"
    >
      <Command shouldFilter={false}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search tasks, timeboxes, notes…"
        />
        <CommandList className="max-h-[60vh]">
          {q ? (
            <>
              {isFetching && !data ? (
                <CommandEmpty>Searching…</CommandEmpty>
              ) : data && data.total === 0 ? (
                <CommandEmpty>No matches for “{q}”.</CommandEmpty>
              ) : null}

              {data && data.tasks.length > 0 ? (
                <CommandGroup heading="Tasks">
                  {data.tasks.map((h) => (
                    <CommandItem
                      key={`task-${h.id}`}
                      value={`task-${h.id}`}
                      onSelect={() => goToHit(h)}
                    >
                      <CheckSquareIcon className="text-muted-foreground" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span
                          className={cn(
                            "truncate",
                            h.completed && "text-muted-foreground line-through"
                          )}
                        >
                          {h.title}
                        </span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {h.list === "later"
                            ? "Later"
                            : h.date
                              ? dayLabel(h.date)
                              : "Task"}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}

              {data && data.timeboxes.length > 0 ? (
                <CommandGroup heading="Timeboxes">
                  {data.timeboxes.map((h) => (
                    <CommandItem
                      key={`box-${h.id}`}
                      value={`box-${h.id}`}
                      onSelect={() => goToHit(h)}
                    >
                      <ClockIcon className="text-muted-foreground" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">{h.title}</span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {h.date ? dayLabel(h.date) : ""}
                          {h.start && h.end
                            ? ` · ${formatRange(h.start, h.end)}`
                            : ""}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}

              {data && data.notes.length > 0 ? (
                <CommandGroup heading="Notes">
                  {data.notes.map((h) => (
                    <CommandItem
                      key={`note-${h.id}`}
                      value={`note-${h.id}`}
                      onSelect={() => goToHit(h)}
                    >
                      <NoteIcon className="text-muted-foreground" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">{h.title}</span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {h.date ? dayLabel(h.date) : ""}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
            </>
          ) : (
            <CommandGroup heading="Actions">
              <CommandItem value="today" onSelect={() => run(onToday)}>
                <CalendarBlankIcon className="text-muted-foreground" />
                <span className="flex-1">Go to today</span>
                <span className="text-[11px] text-muted-foreground">
                  {dayLabel(date)}
                </span>
              </CommandItem>
              <CommandItem value="prev-day" onSelect={() => run(onPrev)}>
                <CaretLeftIcon className="text-muted-foreground" />
                <span className="flex-1">Previous day</span>
              </CommandItem>
              <CommandItem value="next-day" onSelect={() => run(onNext)}>
                <CaretRightIcon className="text-muted-foreground" />
                <span className="flex-1">Next day</span>
              </CommandItem>
              <CommandItem
                value="new-task"
                onSelect={() =>
                  run(() =>
                    window.dispatchEvent(new CustomEvent(FOCUS_NEW_TASK_EVENT))
                  )
                }
              >
                <PlusIcon className="text-muted-foreground" />
                <span className="flex-1">New task</span>
                <CommandShortcut>N</CommandShortcut>
              </CommandItem>
              <CommandSeparator />
              <CommandItem value="settings" onSelect={() => run(onOpenSettings)}>
                <GearSixIcon className="text-muted-foreground" />
                <span className="flex-1">Settings &amp; themes</span>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
