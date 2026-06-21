import { Marquee } from "@/components/magicui/marquee"
import { SectionHeading } from "./SectionHeading"

// ──────────────────────────────────────────────────────────────────────────
// PLACEHOLDER CONTENT — replace with real quotes before launch.
// These are illustrative, not real endorsements. Keep it honest: only ship
// testimonials you actually have permission to publish.
// ──────────────────────────────────────────────────────────────────────────
interface Testimonial {
  quote: string
  name: string
  handle: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Replace this with a real quote about how time-boxing changed someone's day.",
    name: "Your User",
    handle: "@placeholder",
  },
  {
    quote:
      "Another placeholder quote — short, specific, and about an actual outcome.",
    name: "Early Adopter",
    handle: "@placeholder",
  },
  {
    quote:
      "Keep these honest. Swap in genuine feedback from people who use the app.",
    name: "Beta Tester",
    handle: "@placeholder",
  },
  {
    quote:
      "A single SQLite file and no account — placeholder reaction goes here.",
    name: "Self-Hoster",
    handle: "@placeholder",
  },
  {
    quote: "The quick-add parser quote can live here once you collect one.",
    name: "Power User",
    handle: "@placeholder",
  },
]

function TestimonialCard({ quote, name, handle }: Testimonial) {
  return (
    <figure className="tb-card mx-2 w-80 shrink-0 rounded-xl border border-border bg-card p-5">
      <blockquote className="text-sm text-pretty text-foreground/90">
        “{quote}”
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 font-heading text-sm font-semibold text-primary">
          {name.charAt(0)}
        </span>
        <div className="text-sm">
          <div className="font-medium">{name}</div>
          <div className="text-muted-foreground">{handle}</div>
        </div>
      </figcaption>
    </figure>
  )
}

export function Testimonials() {
  return (
    <section className="py-20">
      <SectionHeading
        eyebrow="Testimonials"
        title="Loved by people who plan their day"
        subtitle="Placeholder quotes for now — swap in real ones before you launch."
      />
      <div className="relative mt-12">
        <Marquee pauseOnHover className="[--duration:38s]">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.quote} {...t} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:42s]">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.quote} {...t} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  )
}
