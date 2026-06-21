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
          ""
        )

        if (error || !code) {
          return Response.redirect(`${base}/app?google=error`, 302)
        }
        try {
          const { auth } = await import("@/lib/auth")
          const session = await auth.api.getSession({
            headers: request.headers,
          })
          if (!session) {
            return Response.redirect(
              `${base}/login?redirect=${encodeURIComponent("/app")}`,
              302
            )
          }
          const { hasActiveAccess } = await import("@/server/billing")
          if (!(await hasActiveAccess(session.user.id))) {
            return Response.redirect(`${base}/app?google=subscription`, 302)
          }
          // Dynamic import keeps the database/Node-only code out of the client bundle.
          const { connectWithCode } = await import("@/server/google-connect")
          await connectWithCode(session.user.id, code)
          return Response.redirect(`${base}/app?google=connected`, 302)
        } catch {
          return Response.redirect(`${base}/app?google=error`, 302)
        }
      },
    },
  },
})
