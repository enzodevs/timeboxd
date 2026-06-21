import { useQuery } from "@tanstack/react-query"

import { getBillingStatus } from "@/server/billing"

export const billingStatusKey = ["billing", "status"] as const

export function useBillingStatus() {
  return useQuery({
    queryKey: billingStatusKey,
    queryFn: () => getBillingStatus(),
    staleTime: 60_000,
  })
}
