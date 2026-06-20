import { createFileRoute } from "@tanstack/react-router"

import { appBaseUrl } from "@/lib/google/oauth"
import { connectWithCode } from "@/server/google"

export const Route = createFileRoute("/api/auth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const code = url.searchParams.get("code")
        const error = url.searchParams.get("error")
        const base = appBaseUrl()

        if (error || !code) {
          return Response.redirect(`${base}/?google=error`, 302)
        }
        try {
          await connectWithCode(code)
          return Response.redirect(`${base}/?google=connected`, 302)
        } catch {
          return Response.redirect(`${base}/?google=error`, 302)
        }
      },
    },
  },
})
