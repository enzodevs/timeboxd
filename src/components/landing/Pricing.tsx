import { Link } from "@tanstack/react-router"
import { CheckIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { BlurFade } from "@/components/magicui/blur-fade"
import { BorderBeam } from "@/components/magicui/border-beam"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { SectionHeading } from "./SectionHeading"
import { SITE } from "./site"

interface Tier {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  cta: string
  href: string
  featured?: boolean
  disabled?: boolean
  external?: boolean
}

// Honest pricing for a free, open-source, self-hosted tool.
// "Cloud" is a placeholder for a future hosted option — edit or remove.
const TIERS: Tier[] = [
  {
    name: "Self-Hosted",
    price: "Free",
    description: "The whole app, forever. Run it on your own machine.",
    features: [
      "Every feature, no limits",
      "Local-first — one SQLite file",
      "Optional Google Calendar & Tasks sync",
      "MIT licensed — fork it, change it",
    ],
    cta: "Launch app",
    href: SITE.appPath,
    featured: true,
  },
  {
    name: "Cloud",
    price: "Soon",
    description: "A hosted version, if there's demand. Not available yet.",
    features: [
      "Nothing to install",
      "Sync across devices",
      "Automatic backups",
      "Same app, managed for you",
    ],
    cta: "Coming soon",
    href: "#",
    disabled: true,
  },
  {
    name: "Sponsor",
    price: "$5",
    period: "/mo",
    description: "Support development and keep timeboxd independent.",
    features: [
      "Back an open-source project",
      "Help shape the roadmap",
      "Your name in the README",
      "Cancel anytime",
    ],
    cta: "Become a sponsor",
    href: SITE.githubUrl,
    external: true,
  },
]

function PriceCard({ tier }: { tier: Tier }) {
  return (
    <div
      className={cn(
        "tb-card tb-card-interactive relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-6",
        tier.featured ? "tb-highlight border-primary/50" : "border-border"
      )}
    >
      {tier.featured ? (
        <>
          <span className="absolute top-5 right-5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
            Recommended
          </span>
          <BorderBeam duration={9} />
        </>
      ) : null}

      <h3 className="font-heading text-lg font-semibold">{tier.name}</h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-heading text-4xl font-semibold tracking-tight">
          {tier.price}
        </span>
        {tier.period ? (
          <span className="text-muted-foreground">{tier.period}</span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>

      <ul className="mt-6 space-y-3 text-sm">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 pt-2">
        {tier.disabled ? (
          <button
            type="button"
            disabled
            className="inline-flex h-10 w-full cursor-not-allowed items-center justify-center rounded-lg border border-border bg-muted/50 text-sm font-medium text-muted-foreground"
          >
            {tier.cta}
          </button>
        ) : tier.featured ? (
          <RainbowButton asChild className="w-full">
            <Link to={tier.href}>{tier.cta}</Link>
          </RainbowButton>
        ) : tier.external ? (
          <a
            href={tier.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-medium transition hover:bg-muted"
          >
            {tier.cta}
          </a>
        ) : (
          <Link
            to={tier.href}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-medium transition hover:bg-muted"
          >
            {tier.cta}
          </Link>
        )}
      </div>
    </div>
  )
}

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Pricing"
        title="Free and open source"
        subtitle="timeboxd is free to self-host, forever. Support it only if you want to."
      />
      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {TIERS.map((tier, i) => (
          <BlurFade key={tier.name} delay={0.08 * i} inView className="h-full">
            <PriceCard tier={tier} />
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
