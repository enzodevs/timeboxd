import { useQuery } from "@tanstack/react-query"

import { searchAll } from "@/server/search"

/** Server-backed search over tasks, timeboxes, and notes. */
export function useSearch(q: string) {
  const query = q.trim()
  return useQuery({
    queryKey: ["search", query] as const,
    queryFn: () => searchAll({ data: { q: query } }),
    enabled: query.length > 0,
    staleTime: 10_000,
    // Keep the prior results visible while the next query is in flight.
    placeholderData: (prev) => prev,
  })
}
