import * as React from "react"

import type { Timebox as TimeboxRow } from "@/db/schema"
import { Timeline } from "./Timeline"

interface CalendarColumnProps {
  date: string
  gridRef: React.RefObject<HTMLDivElement | null>
  googleConnected?: boolean
  onViewInGoogle?: (box: TimeboxRow) => void
}

export function CalendarColumn({
  date,
  gridRef,
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
    </section>
  )
}
