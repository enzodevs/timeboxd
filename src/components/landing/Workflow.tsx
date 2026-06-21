import type { Icon } from "@phosphor-icons/react"
import {
  CalendarCheckIcon,
  KeyboardIcon,
  TargetIcon,
} from "@phosphor-icons/react"

import { BlurFade } from "@/components/magicui/blur-fade"
import { SectionHeading } from "./SectionHeading"

interface Step {
  icon: Icon
  step: string
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    icon: KeyboardIcon,
    step: "01",
    title: "Capture",
    body: "Brain-dump every to-do. The quick-add parser turns one line into a tagged, scheduled, deep-work task.",
  },
  {
    icon: CalendarCheckIcon,
    step: "02",
    title: "Box",
    body: "Drag tasks onto the timeline to commit real time to them. Resize to fit, with 15-minute snapping.",
  },
  {
    icon: TargetIcon,
    step: "03",
    title: "Focus",
    body: "Follow the plan with a live now-indicator, check things off, and braindump notes as the day unfolds.",
  },
]

export function Workflow() {
  return (
    <section id="workflow" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="How it works"
        title="From a messy list to a boxed-in day"
        subtitle="Three steps, all keyboard-friendly. No setup, no accounts."
      />

      {/* quick-add demo */}
      <BlurFade delay={0.1} inView>
        <div className="tb-card mx-auto mt-12 max-w-2xl overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
            <KeyboardIcon className="size-4" />
            Press <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono">N</kbd> to add a task
          </div>
          <div className="p-5">
            <div className="tb-sunken flex items-center rounded-lg border border-border bg-muted/40 px-3 py-2.5 font-mono text-sm">
              <span className="text-muted-foreground">$&nbsp;</span>
              Study
              <span className="text-primary">&nbsp;#school</span>
              <span className="text-timebox-deep">&nbsp;-d</span>
              <span className="text-foreground">&nbsp;@7pm-8pm</span>
              <span className="ml-1 inline-block h-4 w-px animate-pulse bg-primary" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                tag · school
              </span>
              <span className="rounded-full bg-timebox/15 px-2 py-1 text-timebox-deep">
                deep work
              </span>
              <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
                scheduled · 7:00–8:00 PM
              </span>
            </div>
          </div>
        </div>
      </BlurFade>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          return (
            <BlurFade key={s.step} delay={0.1 + 0.08 * i} inView>
              <div className="tb-card tb-card-interactive relative h-full rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon weight="duotone" className="size-5" />
                  </span>
                  <span className="font-heading text-3xl font-semibold text-muted-foreground/30">
                    {s.step}
                  </span>
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-pretty text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </BlurFade>
          )
        })}
      </div>
    </section>
  )
}
