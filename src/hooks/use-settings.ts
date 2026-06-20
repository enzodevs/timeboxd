import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getSettings, updateSettings } from "@/server/settings"

export const settingsKey = ["settings"] as const

export function useSettings() {
  return useQuery({ queryKey: settingsKey, queryFn: () => getSettings() })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Parameters<typeof updateSettings>[0]["data"]) =>
      updateSettings({ data: patch }),
    onSettled: () => qc.invalidateQueries({ queryKey: settingsKey }),
  })
}
