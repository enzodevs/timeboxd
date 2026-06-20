import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  disconnectGoogle,
  getGoogleAuthUrl,
  getGoogleEvents,
  getGoogleStatus,
  importGoogleTasks,
  pushTimeboxToGoogle,
} from "@/server/google"

export const googleStatusKey = ["google", "status"] as const
export const googleEventsKey = (date: string) =>
  ["google", "events", date] as const

export function useGoogleStatus() {
  return useQuery({
    queryKey: googleStatusKey,
    queryFn: () => getGoogleStatus(),
    staleTime: 60_000,
  })
}

/** External Google Calendar events for a day (empty unless connected). */
export function useGoogleEvents(date: string, enabled: boolean) {
  return useQuery({
    queryKey: googleEventsKey(date),
    queryFn: () => getGoogleEvents({ data: { date } }),
    enabled,
    staleTime: 60_000,
  })
}

export function useGoogleActions() {
  const qc = useQueryClient()

  const connect = useMutation({
    mutationFn: () => getGoogleAuthUrl(),
    onSuccess: ({ url }) => {
      window.location.href = url
    },
  })

  const disconnect = useMutation({
    mutationFn: () => disconnectGoogle(),
    onSettled: () => qc.invalidateQueries({ queryKey: ["google"] }),
  })

  const importTasks = useMutation({
    mutationFn: () => importGoogleTasks(),
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  })

  const pushTimebox = useMutation({
    mutationFn: (id: string) => pushTimeboxToGoogle({ data: { id } }),
  })

  return { connect, disconnect, importTasks, pushTimebox }
}
