import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

import type { Task } from "@/db/schema"
import { cn } from "@/lib/utils"
import { TodoItem } from "./TodoItem"

interface SortableTaskListProps {
  id: "today" | "later"
  tasks: Task[]
  date: string
  empty: React.ReactNode
  googleConnected?: boolean
  onViewInGoogle?: (task: Task) => void
  readOnly?: boolean
  className?: string
}

export function SortableTaskList({
  id,
  tasks,
  date,
  empty,
  googleConnected,
  onViewInGoogle,
  readOnly,
  className,
}: SortableTaskListProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { containerId: id },
    disabled: readOnly,
  })

  return (
    <SortableContext
      id={id}
      items={tasks.map((t) => t.id)}
      strategy={verticalListSortingStrategy}
    >
      <ul
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-col gap-1.5 rounded-lg p-0.5 transition-colors",
          isOver && "bg-primary/5 ring-1 ring-primary/20 ring-inset",
          className
        )}
      >
        {tasks.length === 0
          ? empty
          : tasks.map((task) => (
              <TodoItem
                key={task.id}
                task={task}
                date={date}
                containerId={id}
                googleConnected={googleConnected}
                onViewInGoogle={onViewInGoogle}
                readOnly={readOnly}
              />
            ))}
      </ul>
    </SortableContext>
  )
}
