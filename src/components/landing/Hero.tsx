import * as React from "react"
import { Link } from "@tanstack/react-router"
import { useInView, useReducedMotion } from "motion/react"
import { CheckCircleIcon, CircleIcon } from "@phosphor-icons/react"

import {
  GithubIcon,
  MoveRightIcon,
  useIconHover,
} from "@/components/animateicons"
import { cn } from "@/lib/utils"
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text"
import { BlurFade } from "@/components/magicui/blur-fade"
import { BorderBeam } from "@/components/magicui/border-beam"
import { DotPattern } from "@/components/magicui/dot-pattern"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { SITE } from "./site"

export function Hero() {
  const badgeHover = useIconHover()
  const launchHover = useIconHover()
  const githubHover = useIconHover()
  return (
    <section id="top" className="relative overflow-hidden pt-16 pb-12 sm:pt-24">
      <DotPattern
        width={22}
        height={22}
        className="[mask-image:radial-gradient(560px_circle_at_center,white,transparent)] opacity-60"
      />
      {/* brand glow */}
      <div
        aria-hidden
        className="absolute top-[-10%] left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      />

      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <BlurFade delay={0.05} inView>
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={badgeHover.onMouseEnter}
            onMouseLeave={badgeHover.onMouseLeave}
            className="group mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm shadow-sm backdrop-blur transition hover:bg-card"
          >
            <span className="flex size-1.5 rounded-full bg-primary" />
            <AnimatedShinyText className="inline-flex items-center">
              Open source · Local-first · No account
            </AnimatedShinyText>
            <MoveRightIcon
              ref={badgeHover.ref}
              size={14}
              className="text-muted-foreground"
            />
          </a>
        </BlurFade>

        <BlurFade delay={0.12} inView>
          <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Plan your day.{" "}
            <span className="bg-gradient-to-r from-primary to-timebox-deep bg-clip-text text-transparent">
              Box your time.
            </span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.18} inView>
          <p className="mx-auto mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
            Turn a messy to-do list into a plan you'll actually follow. Drag
            tasks onto a timeline as time-boxes, braindump notes, and keep your
            whole day in one keyboard-friendly workspace.
          </p>
        </BlurFade>

        <BlurFade delay={0.24} inView>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <RainbowButton asChild size="lg">
              <Link
                to={SITE.appPath}
                onMouseEnter={launchHover.onMouseEnter}
                onMouseLeave={launchHover.onMouseLeave}
              >
                Launch app
                <MoveRightIcon ref={launchHover.ref} size={16} />
              </Link>
            </RainbowButton>
            <a
              href={SITE.githubUrl}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={githubHover.onMouseEnter}
              onMouseLeave={githubHover.onMouseLeave}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 text-base font-medium shadow-sm transition hover:bg-muted"
            >
              <GithubIcon ref={githubHover.ref} size={20} />
              Star on GitHub
            </a>
          </div>
        </BlurFade>

        <BlurFade delay={0.3} inView>
          <p className="mt-4 text-sm text-muted-foreground">
            Free &amp; MIT-licensed. Your data stays in a single SQLite file on
            your machine.
          </p>
        </BlurFade>
      </div>

      {/* App preview */}
      <BlurFade delay={0.36} inView>
        <div className="mx-auto mt-14 max-w-5xl px-4 sm:px-6">
          <div className="tb-card relative rounded-xl border border-border bg-card/80 p-2 backdrop-blur">
            <BorderBeam
              duration={8}
              borderWidth={2}
              colorFrom="var(--color-1)"
              colorTo="var(--color-3)"
            />
            <AppPreviewReveal />
          </div>
        </div>
      </BlurFade>
    </section>
  )
}

/** Static stylized mock of the three-pane workspace. Decorative only. */
function AppPreview() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      {/* window bar */}
      <div className="flex h-9 items-center gap-2 border-b border-border bg-muted/40 px-3">
        <span className="size-2.5 rounded-full bg-destructive/60" />
        <span className="size-2.5 rounded-full bg-yellow-500/60" />
        <span className="size-2.5 rounded-full bg-primary/60" />
        <span className="ml-3 text-xs text-muted-foreground">
          Wednesday, June 21
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.2fr_1fr]">
        {/* To-do pane */}
        <div className="space-y-3 border-border p-4 sm:border-r">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            To-do
          </p>
          <div className="tb-sunken rounded-md border border-border bg-muted/40 px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground">
            Study <span className="text-primary">#school</span>{" "}
            <span className="text-timebox-deep">-d</span>{" "}
            <span className="text-foreground">@7pm-8pm</span>
          </div>
          {[
            { t: "Review PRs", done: true, tag: "work" },
            { t: "Deep work: thesis", done: false, tag: "school" },
            { t: "Gym", done: false, tag: "life" },
            { t: "Reply to emails", done: false, tag: "work" },
          ].map((task) => (
            <div key={task.t} className="flex items-center gap-2 text-sm">
              {task.done ? (
                <CheckCircleIcon
                  weight="fill"
                  className="size-4 text-primary"
                />
              ) : (
                <CircleIcon className="size-4 text-muted-foreground/50" />
              )}
              <span
                className={cn(
                  task.done && "text-muted-foreground line-through"
                )}
              >
                {task.t}
              </span>
              <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                #{task.tag}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline pane */}
        <div className="relative border-border p-4 sm:border-r">
          <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Timeline
          </p>
          <div className="relative space-y-3">
            {["9 AM", "10 AM", "11 AM", "12 PM", "1 PM"].map((h) => (
              <div
                key={h}
                className="flex items-center gap-2 border-t border-dashed border-border/70 pt-1 text-[10px] text-muted-foreground"
              >
                {h}
              </div>
            ))}
            {/* time-boxes */}
            <div className="absolute top-1 right-2 left-12 h-10 rounded-md border border-primary/30 bg-primary/15 px-2 py-1 text-[11px] font-medium text-primary">
              Deep work: thesis
            </div>
            <div className="absolute top-[88px] right-16 left-12 h-8 rounded-md border border-timebox-deep/30 bg-timebox/15 px-2 py-1 text-[11px] font-medium text-timebox-deep">
              Review PRs
            </div>
            {/* now indicator */}
            <div className="absolute top-[70px] right-0 left-10 flex items-center">
              <span className="size-2 rounded-full bg-destructive" />
              <span className="h-px flex-1 bg-destructive/60" />
            </div>
          </div>
        </div>

        {/* Notes pane */}
        <div className="space-y-2 p-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Notes
          </p>
          <div className="h-2 w-4/5 rounded bg-muted" />
          <div className="h-2 w-full rounded bg-muted" />
          <div className="h-2 w-3/5 rounded bg-muted" />
          <div className="mt-3 h-2 w-2/3 rounded bg-muted" />
          <div className="h-2 w-11/12 rounded bg-muted" />
          <div className="mt-3 flex gap-1.5">
            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary">
              autosaved
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Shows a pulsing skeleton, then cross-fades + de-blurs into the real preview. */
function AppPreviewReveal() {
  const reduced = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const [revealed, setRevealed] = React.useState(false)

  React.useEffect(() => {
    if (reduced) {
      setRevealed(true)
      return
    }
    if (!inView) return
    const timer = window.setTimeout(() => setRevealed(true), 1100)
    return () => window.clearTimeout(timer)
  }, [inView, reduced])

  return (
    <div ref={ref} className="relative">
      <div
        className={cn(
          "transition-[opacity,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          revealed ? "blur-0 opacity-100" : "opacity-0 blur-[6px]"
        )}
      >
        <AppPreview />
      </div>
      {!revealed ? (
        <div className="absolute inset-0">
          <AppPreviewSkeleton />
        </div>
      ) : null}
    </div>
  )
}

/** Loading placeholder that mirrors the three-pane layout. */
function AppPreviewSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex h-9 items-center gap-2 border-b border-border bg-muted/40 px-3">
        <span className="size-2.5 rounded-full bg-muted" />
        <span className="size-2.5 rounded-full bg-muted" />
        <span className="size-2.5 rounded-full bg-muted" />
        <span className="ml-3 h-2.5 w-28 rounded bg-muted" />
      </div>
      <div className="grid animate-pulse grid-cols-1 sm:grid-cols-[1fr_1.2fr_1fr]">
        {[
          { rows: 5, border: true },
          { rows: 4, border: true },
          { rows: 5, border: false },
        ].map((pane, p) => (
          <div
            key={p}
            className={cn(
              "space-y-3 border-border p-4",
              pane.border && "sm:border-r"
            )}
          >
            <div className="h-2.5 w-16 rounded bg-muted" />
            {Array.from({ length: pane.rows }).map((_, r) => (
              <div
                key={r}
                className="h-3 rounded bg-muted"
                style={{ width: `${90 - ((r * 13) % 45)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
