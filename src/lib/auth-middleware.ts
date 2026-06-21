import { createMiddleware } from "@tanstack/react-start"

import { auth } from "@/lib/auth"

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw new Error("UNAUTHORIZED")
    return next({ context: { userId: session.user.id } })
  }
)
