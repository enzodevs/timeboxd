import { BlurFade } from "@/components/magicui/blur-fade"
import { NumberTicker } from "@/components/magicui/number-ticker"

// Honest, product-true facts — not social-proof metrics.
const STATS: {
  value: number
  suffix?: string
  prefix?: string
  label: string
}[] = [
  { value: 3, label: "panes — to-do, timeline, notes" },
  { value: 15, suffix: " min", label: "snap precision on every time-box" },
  { value: 1, label: "SQLite file — your data, your machine" },
  { value: 0, label: "accounts or sign-ups required" },
]

export function Stats() {
  return (
    <section className="border-y border-border/60 bg-card/40 py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <BlurFade key={stat.label} delay={0.08 * i} inView>
            <div className="text-center">
              <div className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {stat.prefix}
                <NumberTicker value={stat.value} />
                {stat.suffix}
              </div>
              <p className="mx-auto mt-2 max-w-[12rem] text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
