import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"

import type { Task } from "@/db/schema"
import {
  createTask,
  deleteTask,
  listTasks,
  reorderTasks,
  updateTask,
} from "@/server/tasks"
import type { TaskLists } from "@/server/tasks"

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

  return { create, update, remove, reorder }
}

/** Optimistically write the full lists into the cache (used during drag-drop). */
export function setTasksCache(qc: QueryClient, date: string, lists: TaskLists) {
  qc.setQueryData<TaskLists>(tasksKey(date), lists)
}
