import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { PlusIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { BlurFade } from "@/components/magicui/blur-fade"
import { SectionHeading } from "./SectionHeading"

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is timeboxd really free?",
    a: "Yes. It's open source under the MIT license — free to use, self-host, fork, and modify.",
  },
  {
    q: "Do I need an account to use it?",
    a: "No. There are no sign-ups and no servers you depend on. You just run the app and start planning.",
  },
  {
    q: "Where is my data stored?",
    a: "In a single SQLite file on your own machine (data/timeboxd.db), created automatically on first run. It never leaves your computer unless you choose to sync.",
  },
  {
    q: "Do I have to connect Google?",
    a: "No — the app is fully functional without it. If you want two-way sync, you can connect your own Google Calendar and Tasks with your own OAuth credentials.",
  },
  {
    q: "Can I self-host it?",
    a: "Yes. Clone the repo, run pnpm build, and start it with Node. It's a standard TanStack Start app, so it runs anywhere Node does.",
  },
  {
    q: "Does it support light and dark themes?",
    a: "Both, plus the system setting. There's a one-click toggle in the top bar.",
  },
]

export function FAQ() {
  // Single-open accordion so the active indicator has one place to slide to.
  const [active, setActive] = React.useState<number | null>(null)
  const reduced = useReducedMotion()

  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="FAQ" title="Questions, answered" />
      <BlurFade delay={0.1} inView>
        <div className="mt-10">
          {FAQS.map((faq, i) => {
            const open = active === i
            return (
              <div key={faq.q} className="relative border-b border-border">
                {/* Sliding active indicator — motion's shared layout moves it
                    between questions automatically. */}
                {open ? (
                  <motion.span
                    layoutId={reduced ? undefined : "faq-indicator"}
                    className="absolute top-0 left-0 h-full w-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => setActive(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 pl-4 text-left"
                  aria-expanded={open}
                >
                  <span
                    className={cn(
                      "font-medium transition-colors duration-200",
                      open && "text-primary"
                    )}
                  >
                    {faq.q}
                  </span>
                  <PlusIcon
                    className={cn(
                      "size-5 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      open && "rotate-45 text-primary"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid pl-4 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    open
                      ? "grid-rows-[1fr] pb-5 opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <p className="overflow-hidden text-sm text-pretty text-muted-foreground">
                    {faq.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </BlurFade>
    </section>
  )
}
