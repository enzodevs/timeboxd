import { createServerFn } from "@tanstack/react-start"
import { desc, eq } from "drizzle-orm"

import { db } from "@/db/client"
import { ensureDb } from "@/db/migrate"
import { subscriptions } from "@/db/schema"
import type { Subscription } from "@/db/schema"
import { authMiddleware } from "@/lib/auth-middleware"

const ACTIVE = ["active", "on_trial"] as const

export interface AccessState {
  hasActiveAccess: boolean
  selfHosted: boolean
}

export function subscriptionAllowsAccess(
  sub: Pick<Subscription, "status" | "currentPeriodEnd"> | null,
  now = new Date()
): boolean {
  if (!sub) return false
  const periodActive =
    !sub.currentPeriodEnd || sub.currentPeriodEnd.getTime() > now.getTime()
  if (!periodActive) return false
  if (ACTIVE.includes(sub.status as (typeof ACTIVE)[number])) return true
  return sub.status === "cancelled"
}

export async function getLatestSubscription(
  userId: string
): Promise<Subscription | null> {
  await ensureDb()
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.updatedAt))
    .limit(1)
  return sub ?? null
}

export async function hasActiveAccess(userId: string): Promise<boolean> {
  if (process.env.SELF_HOSTED === "true") return true
  return subscriptionAllowsAccess(await getLatestSubscription(userId))
}

export const getAccess = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AccessState> => {
    const selfHosted = process.env.SELF_HOSTED === "true"
    return {
      selfHosted,
      hasActiveAccess: selfHosted
        ? true
        : await hasActiveAccess(context.userId),
    }
  })

export const getBillingStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const selfHosted = process.env.SELF_HOSTED === "true"
    const subscription = await getLatestSubscription(context.userId)
    return {
      selfHosted,
      hasActiveAccess: selfHosted
        ? true
        : subscriptionAllowsAccess(subscription),
      subscription,
    }
  })
