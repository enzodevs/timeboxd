import { afterEach, describe, expect, it } from "vitest"

process.env.BETTER_AUTH_SECRET ??= "test-secret-for-billing-policy"
process.env.BETTER_AUTH_URL ??= "http://localhost:3000"

const future = new Date("2026-07-01T00:00:00.000Z")
const past = new Date("2026-01-01T00:00:00.000Z")
const now = new Date("2026-06-21T00:00:00.000Z")

describe("subscriptionAllowsAccess", () => {
  it("rejects missing subscriptions", async () => {
    const { subscriptionAllowsAccess } = await import("./billing")
    expect(subscriptionAllowsAccess(null, now)).toBe(false)
  })

  it("allows active and trial subscriptions before period end", async () => {
    const { subscriptionAllowsAccess } = await import("./billing")

    expect(
      subscriptionAllowsAccess(
        { status: "on_trial", currentPeriodEnd: future },
        now
      )
    ).toBe(true)
    expect(
      subscriptionAllowsAccess(
        { status: "active", currentPeriodEnd: future },
        now
      )
    ).toBe(true)
  })

  it("rejects expired active subscriptions", async () => {
    const { subscriptionAllowsAccess } = await import("./billing")

    expect(
      subscriptionAllowsAccess(
        { status: "active", currentPeriodEnd: past },
        now
      )
    ).toBe(false)
  })

  it("allows cancelled subscriptions until their period ends", async () => {
    const { subscriptionAllowsAccess } = await import("./billing")

    expect(
      subscriptionAllowsAccess(
        { status: "cancelled", currentPeriodEnd: future },
        now
      )
    ).toBe(true)
    expect(
      subscriptionAllowsAccess(
        { status: "cancelled", currentPeriodEnd: past },
        now
      )
    ).toBe(false)
  })
})

describe("hasActiveAccess", () => {
  const originalSelfHosted = process.env.SELF_HOSTED

  afterEach(() => {
    if (originalSelfHosted === undefined) {
      delete process.env.SELF_HOSTED
      return
    }
    process.env.SELF_HOSTED = originalSelfHosted
  })

  it("bypasses subscription checks for self-hosted installs", async () => {
    process.env.SELF_HOSTED = "true"
    const { hasActiveAccess } = await import("./billing")

    await expect(hasActiveAccess("missing-user")).resolves.toBe(true)
  })
})
