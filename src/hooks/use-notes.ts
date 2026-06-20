import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { JsonValue } from "@/db/schema"
import { getNote, saveNote } from "@/server/notes"

export const noteKey = (date: string) => ["note", date] as const

export function useNote(date: string) {
  return useQuery({
    queryKey: noteKey(date),
    queryFn: () => getNote({ data: { date } }),
  })
}

export function useSaveNote(date: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { content: JsonValue | null; text: string }) =>
      saveNote({ data: { date, ...vars } }),
    onSettled: () => qc.invalidateQueries({ queryKey: noteKey(date) }),
  })
}
