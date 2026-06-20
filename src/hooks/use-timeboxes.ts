import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Timebox } from "@/db/schema"
import {
  createTimebox,
  deleteTimebox,
  listTimeboxes,
  updateTimebox,
} from "@/server/timeboxes"

export const timeboxesKey = (date: string) => ["timeboxes", date] as const

export function useTimeboxes(date: string) {
  return useQuery({
    queryKey: timeboxesKey(date),
    queryFn: () => listTimeboxes({ data: { date } }),
  })
}

type Patch = Parameters<typeof updateTimebox>[0]["data"]["patch"]

export function useTimeboxMutations(date: string) {
  const qc = useQueryClient()
  const key = timeboxesKey(date)

  const create = useMutation({
    mutationFn: (input: Parameters<typeof createTimebox>[0]["data"]) =>
      createTimebox({ data: input }),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })

  const update = useMutation({
    mutationFn: (vars: { id: string; patch: Patch }) =>
      updateTimebox({ data: vars }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<Timebox[]>(key)
      if (prev)
        qc.setQueryData<Timebox[]>(
          key,
          prev.map((b) =>
            b.id === vars.id ? { ...b, ...(vars.patch as Partial<Timebox>) } : b
          )
        )
      return { prev }
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteTimebox({ data: { id } }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<Timebox[]>(key)
      if (prev)
        qc.setQueryData<Timebox[]>(
          key,
          prev.filter((b) => b.id !== id)
        )
      return { prev }
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(key, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { create, update, remove }
}
