import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/auth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const code = url.searchParams.get("code")
        const error = url.searchParams.get("error")
        const base = (process.env.APP_URL ?? "http://localhost:3000").replace(
          /\/$/,
          "",
        )

        if (error || !code) {
          return Response.redirect(`${base}/?google=error`, 302)
        }
        try {
          // Dynamic import keeps the database/Node-only code out of the client bundle.
          const { connectWithCode } = await import("@/server/google-connect")
          await connectWithCode(code)
          return Response.redirect(`${base}/?google=connected`, 302)
        } catch {
          return Response.redirect(`${base}/?google=error`, 302)
        }
      },
    },
  },
})
