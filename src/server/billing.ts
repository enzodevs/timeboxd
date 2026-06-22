import { createServerFn } from "@tanstack/react-start"
import { desc, eq } from "drizzle-orm"

import { db } from "@/db/client"
import { ensureDb } from "@/db/migrate"
import { subscriptions } from "@/db/schema"
import type { Subscription } from "@/db/schema"
import { authMiddleware } from "@/lib/auth-middleware"

const ACTIVE = ["active", "on_trial"] as const

/**
 * True when running in free / self-hosted mode (subscription gating bypassed).
 * Tolerant of stray whitespace or casing in the env value — e.g. a trailing
 * newline from `echo "true" | vercel env add` would otherwise make a literal
 * `=== "true"` check fail and block every write.
 */
export function isSelfHosted(): boolean {
  return (process.env.SELF_HOSTED ?? "").trim().toLowerCase() === "true"
}

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
  if (isSelfHosted()) return true
  return subscriptionAllowsAccess(await getLatestSubscription(userId))
}

export const getAccess = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AccessState> => {
    const selfHosted = isSelfHosted()
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
    const selfHosted = isSelfHosted()
    const subscription = await getLatestSubscription(context.userId)
    return {
      selfHosted,
      hasActiveAccess: selfHosted
        ? true
        : subscriptionAllowsAccess(subscription),
      subscription,
    }
  })
