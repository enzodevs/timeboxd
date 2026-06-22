import { BlurFade } from "@/components/magicui/blur-fade"
import { Marquee } from "@/components/magicui/marquee"
import { SectionHeading } from "./SectionHeading"

// ──────────────────────────────────────────────────────────────────────────
// PLACEHOLDER CONTENT — illustrative quotes, NOT real endorsements. They read
// like genuine feedback so the section looks finished, but swap in real,
// permissioned quotes before launch. Don't publish these as if they're real.
// ──────────────────────────────────────────────────────────────────────────
interface Testimonial {
  quote: string
  name: string
  handle: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Typing `Deep work #thesis -d @9am-11am` and watching it land on the timeline is weirdly satisfying. My mornings finally have a shape.",
    name: "Maya Renner",
    handle: "@mayabuilds",
  },
  {
    quote:
      "Drag-to-timebox cured my over-planning. If the day's already full I can see it at 9am, not at midnight.",
    name: "Daniel Okafor",
    handle: "@danokafor",
  },
  {
    quote:
      "One SQLite file, no account, runs on my own laptop. I finally trust a planner with my whole day.",
    name: "Priya Nair",
    handle: "@priyacodes",
  },
  {
    quote:
      "⌘K and N are basically the whole app for me. I plan tomorrow without my hands leaving the keyboard.",
    name: "Tom Becker",
    handle: "@tombckr",
  },
  {
    quote:
      "The per-day notes pane replaced my scratch text file. Braindump in the morning, check it off by night.",
    name: "Sofia Almeida",
    handle: "@sofiaplans",
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
        subtitle="How quick capture and time-boxing reshape an ordinary day."
      />
      <BlurFade delay={0.1} inView>
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
      </BlurFade>
    </section>
  )
}
