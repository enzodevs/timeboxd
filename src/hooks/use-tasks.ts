import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { Task, Timebox } from "@/db/schema"
import {
  createTask,
  deleteTask,
  listTasks,
  reorderTasks,
  updateTask,
} from "@/server/tasks"
import type { TaskLists } from "@/server/tasks"
import { timeboxesKey } from "@/hooks/use-timeboxes"

export const tasksKey = (date: string) => ["tasks", date] as const

export function useTasks(date: string) {
  return useQuery({
    queryKey: tasksKey(date),
    queryFn: () => listTasks({ data: { date } }),
  })
}

type Patch = Parameters<typeof updateTask>[0] extends { data: infer D }
  ? D extends { patch: infer P }
    ? P
    : never
  : never

function patchLists(
  lists: TaskLists,
  id: string,
  patch: Partial<Task>
): TaskLists {
  const apply = (t: Task) => (t.id === id ? { ...t, ...patch } : t)
  return { today: lists.today.map(apply), later: lists.later.map(apply) }
}

export function useTaskMutations(date: string) {
  const qc = useQueryClient()
  const key = tasksKey(date)

  const create = useMutation({
    mutationFn: (input: Parameters<typeof createTask>[0]["data"]) =>
      createTask({ data: input }),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })

  const update = useMutation({
    mutationFn: (vars: { id: string; patch: Patch }) =>
      updateTask({ data: vars }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<TaskLists>(key)
      if (prev)
        qc.setQueryData<TaskLists>(key, patchLists(prev, vars.id, vars.patch))
      return { prev }
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteTask({ data: { id } }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<TaskLists>(key)
      if (prev)
        qc.setQueryData<TaskLists>(key, {
          today: prev.today.filter((t) => t.id !== id),
          later: prev.later.filter((t) => t.id !== id),
        })
      return { prev }
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })

  const reorder = useMutation({
    mutationFn: (
      updates: Parameters<typeof reorderTasks>[0]["data"]["updates"]
    ) => reorderTasks({ data: { updates } }),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })

  // Undo beats confirmation for reversible deletes: remove from the UI now,
  // show an undo toast, and only hit the server once the toast expires.
  // Deleting a to-do also removes the time-box it spawned (matching the server
  // cascade), so we optimistically drop linked boxes from the current day too.
  const boxesKey = timeboxesKey(date)
  const removeWithUndo = (id: string) => {
    const prev = qc.getQueryData<TaskLists>(key)
    const prevBoxes = qc.getQueryData<Timebox[]>(boxesKey)
    const restore = () => {
      if (prev) qc.setQueryData<TaskLists>(key, prev)
      if (prevBoxes) qc.setQueryData<Timebox[]>(boxesKey, prevBoxes)
    }
    if (prev)
      qc.setQueryData<TaskLists>(key, {
        today: prev.today.filter((t) => t.id !== id),
        later: prev.later.filter((t) => t.id !== id),
      })
    if (prevBoxes)
      qc.setQueryData<Timebox[]>(
        boxesKey,
        prevBoxes.filter((b) => b.taskId !== id)
      )
    let undone = false
    const commit = () => {
      if (undone) return
      void deleteTask({ data: { id } })
        .catch(restore)
        .finally(() => {
          void qc.invalidateQueries({ queryKey: key })
          void qc.invalidateQueries({ queryKey: boxesKey })
        })
    }
    toast("To-do deleted", {
      duration: 6000,
      action: {
        label: "Undo",
        onClick: () => {
          undone = true
          restore()
        },
      },
      onAutoClose: commit,
      onDismiss: commit,
    })
  }

  // Promote a to-do into the day's top-3, or demote it. Demotion is always
  // allowed; promotion is capped at 3 so the list stays a real shortlist.
  const togglePriority = (task: Task) => {
    if (!task.priority) {
      const lists = qc.getQueryData<TaskLists>(key)
      const count = lists?.today.filter((t) => t.priority).length ?? 0
      if (count >= 3) {
        toast("Only 3 top priorities — demote one first")
        return
      }
    }
    update.mutate({ id: task.id, patch: { priority: !task.priority } })
  }

  return { create, update, remove, removeWithUndo, reorder, togglePriority }
}

/** Optimistically write the full lists into the cache (used during drag-drop). */
export function setTasksCache(qc: QueryClient, date: string, lists: TaskLists) {
  qc.setQueryData<TaskLists>(tasksKey(date), lists)
}
