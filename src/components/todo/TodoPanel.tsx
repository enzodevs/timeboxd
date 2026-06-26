import { CursorClickIcon, ListChecksIcon } from "@phosphor-icons/react"

import type { Task } from "@/db/schema"
import { useTasks } from "@/hooks/use-tasks"
import { TodoInput } from "./TodoInput"
import { PriorityZone } from "./PriorityZone"
import { SortableTaskList } from "./SortableTaskList"
import { TaskListSkeleton } from "./TaskListSkeleton"

function EmptyToday({ readOnly }: { readOnly?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center text-sm text-muted-foreground">
      <CursorClickIcon className="size-7 text-primary/70" />
      <p className="max-w-[18rem] leading-relaxed">
        {readOnly ? (
          "No to-dos for this day"
        ) : (
          <>
            Press the{" "}
            <kbd className="rounded border border-border bg-muted px-1 font-mono text-[11px]">
              N
            </kbd>{" "}
            key to add a new to-do for today
          </>
        )}
      </p>
    </div>
  )
}

interface TodoPanelProps {
  date: string
  googleConnected?: boolean
  onViewInGoogle?: (task: Task) => void
  readOnly?: boolean
}

export function TodoPanel({
  date,
  googleConnected,
  onViewInGoogle,
  readOnly,
}: TodoPanelProps) {
  const { data, isLoading } = useTasks(date)
  const today = data?.today ?? []
  const priorities = today.filter((t) => t.priority)
  const rest = today.filter((t) => !t.priority)

  return (
    <section className="flex h-full min-h-0 flex-col gap-3 p-3">
      <div className="flex items-center gap-2">
        <ListChecksIcon className="size-5 text-primary" weight="duotone" />
        <h2 className="text-[15px] font-semibold">To-do</h2>
        {today.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {today.filter((t) => !t.completed).length} left
          </span>
        )}
      </div>
      <TodoInput date={date} readOnly={readOnly} />
      {isLoading ? null : (
        <PriorityZone
          date={date}
          tasks={priorities}
          googleConnected={googleConnected}
          onViewInGoogle={onViewInGoogle}
          readOnly={readOnly}
        />
      )}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <TaskListSkeleton />
        ) : (
          <SortableTaskList
            id="today"
            tasks={rest}
            date={date}
            googleConnected={googleConnected}
            onViewInGoogle={onViewInGoogle}
            readOnly={readOnly}
            empty={<EmptyToday readOnly={readOnly} />}
          />
        )}
      </div>
    </section>
  )
}
