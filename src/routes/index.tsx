import { createFileRoute, redirect } from "@tanstack/react-router"

// The marketing landing page is the host front page; the app lives at /app.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/landing" })
  },
})
