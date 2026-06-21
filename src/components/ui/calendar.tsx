import * as React from "react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/** A token-themed wrapper around react-day-picker (v10). */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const d = getDefaultClassNames()
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: cn(d.months, "flex flex-col gap-3"),
        month: cn(d.month, "flex flex-col gap-3"),
        month_caption: cn(
          d.month_caption,
          "relative flex h-8 items-center justify-center px-9"
        ),
        caption_label: cn(d.caption_label, "font-heading text-sm font-medium"),
        nav: cn(
          d.nav,
          "absolute inset-x-0 top-0 flex items-center justify-between"
        ),
        button_previous: cn(
          d.button_previous,
          "flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
        ),
        button_next: cn(
          d.button_next,
          "flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
        ),
        month_grid: cn(d.month_grid, "w-full border-collapse"),
        weekdays: cn(d.weekdays, "flex"),
        weekday: cn(
          d.weekday,
          "w-9 text-[0.7rem] font-normal text-muted-foreground"
        ),
        week: cn(d.week, "mt-1 flex w-full"),
        day: cn(d.day, "relative size-9 p-0 text-center text-sm"),
        day_button: cn(
          d.day_button,
          "flex size-9 items-center justify-center rounded-md font-normal transition hover:bg-muted"
        ),
        today: cn(
          d.today,
          "[&>button]:bg-accent [&>button]:font-medium [&>button]:text-accent-foreground"
        ),
        selected: cn(
          d.selected,
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary"
        ),
        outside: cn(d.outside, "text-muted-foreground/40"),
        disabled: cn(d.disabled, "text-muted-foreground/40 opacity-50"),
        hidden: cn(d.hidden, "invisible"),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <CaretLeftIcon className="size-4" />
          ) : (
            <CaretRightIcon className="size-4" />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
