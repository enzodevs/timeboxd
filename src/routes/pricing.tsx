import { createFileRoute } from "@tanstack/react-router"

import { LandingFooter } from "@/components/landing/LandingFooter"
import { LandingHeader } from "@/components/landing/LandingHeader"
import { Pricing } from "@/components/landing/Pricing"

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [{ title: "Pricing — timeboxd" }],
  }),
  component: PricingRoute,
})

function PricingRoute() {
  return (
    <div className="landing-surface min-h-screen text-foreground">
      <LandingHeader />
      <main className="pt-8">
        <Pricing />
      </main>
      <LandingFooter />
    </div>
  )
}
