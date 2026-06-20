import { format } from "date-fns"
import {
  CaretLeftIcon,
  CaretRightIcon,
  GlobeHemisphereWestIcon,
  UserIcon,
} from "@phosphor-icons/react"

import { parseYmd, ymd } from "@/lib/time"
import { cn } from "@/lib/utils"

interface DayNavBarProps {
  date: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onOpenSettings: () => void
  googleConnected?: boolean
}

export function DayNavBar({
  date,
  onPrev,
  onNext,
  onToday,
  onOpenSettings,
  googleConnected,
}: DayNavBarProps) {
  const d = parseYmd(date)
  const isToday = date === ymd(new Date())

  const navBtn =
    "flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"

  return (
    <div className="flex shrink-0 items-center justify-center gap-1.5 border-t border-border bg-background/80 px-4 py-2.5 backdrop-blur">
      <button
        type="button"
        aria-label="Previous day"
        onClick={onPrev}
        className={navBtn}
      >
        <CaretLeftIcon className="size-4" />
      </button>

      <div className="flex items-center gap-1 rounded-full border border-border bg-card px-1.5 py-1 shadow-xs">
        <button
          type="button"
          onClick={onToday}
          title="Jump to today"
          className="relative flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <GlobeHemisphereWestIcon className="size-4" />
          <span
            className={cn(
              "absolute top-0.5 right-0.5 size-1.5 rounded-full",
              isToday ? "bg-primary" : "bg-transparent"
            )}
          />
        </button>
        <span className="min-w-[3.5rem] text-center text-sm font-semibold tabular-nums">
          {format(d, "MMM d")}
        </span>
        <button
          type="button"
          onClick={onOpenSettings}
          title="Settings & integrations"
          className="relative flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <UserIcon className="size-4" />
          {googleConnected && (
            <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-primary" />
          )}
        </button>
      </div>

      <button
        type="button"
        aria-label="Next day"
        onClick={onNext}
        className={navBtn}
      >
        <CaretRightIcon className="size-4" />
      </button>
    </div>
  )
}
