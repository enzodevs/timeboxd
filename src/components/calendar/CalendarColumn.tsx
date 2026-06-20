import * as React from "react"

import type { Timebox as TimeboxRow } from "@/db/schema"
import { Timeline } from "./Timeline"
import { DayNavBar } from "./DayNavBar"

interface CalendarColumnProps {
  date: string
  gridRef: React.RefObject<HTMLDivElement | null>
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onOpenSettings: () => void
  googleConnected?: boolean
  onViewInGoogle?: (box: TimeboxRow) => void
}

export function CalendarColumn({
  date,
  gridRef,
  onPrev,
  onNext,
  onToday,
  onOpenSettings,
  googleConnected,
  onViewInGoogle,
}: CalendarColumnProps) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-background">
      <Timeline
        date={date}
        gridRef={gridRef}
        googleConnected={googleConnected}
        onViewInGoogle={onViewInGoogle}
      />
      <DayNavBar
        date={date}
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
        onOpenSettings={onOpenSettings}
        googleConnected={googleConnected}
      />
    </section>
  )
}
