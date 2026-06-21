import { createMiddleware } from "@tanstack/react-start"

import { authMiddleware } from "@/lib/auth-middleware"
import { hasActiveAccess } from "@/server/billing"

export const subscriptionMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    if (!(await hasActiveAccess(context.userId))) {
      throw new Error("SUBSCRIPTION_REQUIRED")
    }
    return next({ context })
  })
