import { createFileRoute, redirect } from "@tanstack/react-router"

import { AppShell } from "@/components/layout/AppShell"
import { getAccess } from "@/server/billing"
import { getSession } from "@/server/session"

export const Route = createFileRoute("/app")({
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (!session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      })
    }
    const access = await getAccess()
    return { session, access }
  },
  component: AppRoute,
})

function AppRoute() {
  const { access } = Route.useRouteContext()
  return <AppShell access={access} />
}
