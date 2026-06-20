import { CalendarPlusIcon, SwapIcon } from "@phosphor-icons/react"

import type { Task } from "@/db/schema"
import { useTasks } from "@/hooks/use-tasks"
import { SortableTaskList } from "./SortableTaskList"

function EmptyLater() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
      <SwapIcon className="size-7 text-primary/60" />
      <p className="max-w-[16rem] leading-relaxed">
        Drag to-dos here that need to be done later
      </p>
    </div>
  )
}

interface TodoLaterPanelProps {
  date: string
  googleConnected?: boolean
  onViewInGoogle?: (task: Task) => void
}

export function TodoLaterPanel({
  date,
  googleConnected,
  onViewInGoogle,
}: TodoLaterPanelProps) {
  const { data } = useTasks(date)
  const later = data?.later ?? []

  return (
    <section className="flex h-full min-h-0 flex-col gap-3 p-3">
      <div className="flex items-center gap-2">
        <CalendarPlusIcon className="size-5 text-primary" weight="duotone" />
        <h2 className="text-[15px] font-semibold">To-do Later</h2>
        {later.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {later.length}
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <SortableTaskList
          id="later"
          tasks={later}
          date={date}
          googleConnected={googleConnected}
          onViewInGoogle={onViewInGoogle}
          empty={<EmptyLater />}
        />
      </div>
    </section>
  )
}
