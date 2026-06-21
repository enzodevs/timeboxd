import { Features } from "./Features"
import { FAQ } from "./FAQ"
import { FinalCTA } from "./FinalCTA"
import { Hero } from "./Hero"
import { LandingFooter } from "./LandingFooter"
import { LandingHeader } from "./LandingHeader"
import { LogoCloud } from "./LogoCloud"
import { Pricing } from "./Pricing"
import { Stats } from "./Stats"
import { Testimonials } from "./Testimonials"
import { Workflow } from "./Workflow"

export function LandingPage() {
  return (
    <div className="landing-surface min-h-screen text-foreground">
      <LandingHeader />
      <main>
        <Hero />
        <LogoCloud />
        <Features />
        <Workflow />
        <Stats />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
