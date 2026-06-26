import { Skeleton } from "@/components/ui/skeleton"

const WIDTHS = ["w-3/5", "w-4/5", "w-1/2", "w-2/3", "w-3/4"]

/** Placeholder rows shown while the task list is loading for the day. */
export function TaskListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-1.5 p-0.5" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2.5"
        >
          <Skeleton className="size-5 shrink-0 rounded-full" />
          <Skeleton className={`h-3.5 ${WIDTHS[i % WIDTHS.length]}`} />
        </div>
      ))}
    </div>
  )
}
