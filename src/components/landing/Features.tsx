import * as React from "react"
import type { Icon } from "@phosphor-icons/react"
import {
  CalendarDotsIcon,
  CheckSquareIcon,
  DatabaseIcon,
  GoogleLogoIcon,
  HandGrabbingIcon,
  KeyboardIcon,
  NoteIcon,
} from "@phosphor-icons/react"

import {
  BookOpenTextIcon,
  BoxesIcon,
  LayersIcon,
  TerminalIcon,
  ZapIcon,
  useIconHover,
} from "@/components/animateicons"
import type { AnimatedIconHandle } from "@/components/animateicons"
import { cn } from "@/lib/utils"
import { BlurFade } from "@/components/magicui/blur-fade"
import { BorderBeam } from "@/components/magicui/border-beam"
import { OrbitingCircles } from "@/components/magicui/orbiting-circles"
import { SectionHeading } from "./SectionHeading"

interface Feature {
  /** Card icon. `ref` drives the animation from the card's hover area. */
  renderIcon: (ref: React.Ref<AnimatedIconHandle>) => React.ReactNode
  title: string
  body: string
  className: string
  beam?: boolean
  visual?: "orbit"
}

const FEATURES: Feature[] = [
  {
    renderIcon: (ref) => <LayersIcon ref={ref} size={20} />,
    title: "One workspace, everything in reach",
    body: "A resizable to-do list, day timeline, and notes — side by side. Plus optional Google Calendar & Tasks, all orbiting a single keyboard-driven screen.",
    className: "md:col-span-2 md:row-span-2",
    beam: true,
    visual: "orbit",
  },
  {
    renderIcon: (ref) => <ZapIcon ref={ref} size={20} />,
    title: "Schedule a task in one line",
    body: "Type `Study #school -d @7pm-8pm` to set a tag, flag deep work, and schedule a time in one line. Press N to focus from anywhere.",
    className: "md:col-span-1",
  },
  {
    renderIcon: (ref) => <BoxesIcon ref={ref} size={20} />,
    title: "Drag tasks into time-boxes",
    body: "Drop a to-do on the timeline to block it. Drag to move, drag the edges to resize with 15-minute snapping. Overlaps lay out side-by-side.",
    className: "md:col-span-1",
  },
  {
    renderIcon: (ref) => <BookOpenTextIcon ref={ref} size={20} />,
    title: "A scratchpad for every day",
    body: "A rich-text notes pane for each day — headings, lists, quotes, code — that autosaves as you type.",
    className: "md:col-span-1",
  },
  {
    // Keep the real Google mark for brand clarity; it stays static.
    renderIcon: () => <GoogleLogoIcon weight="duotone" className="size-5" />,
    title: "Optional Google sync",
    body: "Pull Calendar events onto your timeline, push time-boxes back, and import Google Tasks as to-dos. Entirely optional.",
    className: "md:col-span-1",
  },
  {
    renderIcon: (ref) => <TerminalIcon ref={ref} size={20} />,
    title: "Keyboard-first & themeable",
    body: "⌘K command palette, arrow-key day navigation, light & dark themes. Built to stay out of your way.",
    className: "md:col-span-2",
  },
]

function OrbitBubble({ icon: Icon }: { icon: Icon }) {
  return (
    <div className="flex size-full items-center justify-center rounded-full border border-border bg-background shadow-sm">
      <Icon weight="duotone" className="size-5 text-primary" />
    </div>
  )
}

/** Integrations and panes orbiting the timeboxd mark — the big-cell visual. */
function OrbitVisual() {
  return (
    <div className="relative flex min-h-[260px] flex-1 items-center justify-center">
      <img
        src="/timebox-icon.webp"
        alt=""
        width={64}
        height={64}
        className="absolute z-10 size-16 object-contain drop-shadow-[0_6px_20px_oklch(0.72_0.135_163/0.4)]"
      />
      <OrbitingCircles radius={62} duration={18} iconSize={36}>
        <OrbitBubble icon={CalendarDotsIcon} />
        <OrbitBubble icon={CheckSquareIcon} />
        <OrbitBubble icon={NoteIcon} />
      </OrbitingCircles>
      <OrbitingCircles radius={108} duration={28} iconSize={36} reverse>
        <OrbitBubble icon={GoogleLogoIcon} />
        <OrbitBubble icon={DatabaseIcon} />
        <OrbitBubble icon={KeyboardIcon} />
        <OrbitBubble icon={HandGrabbingIcon} />
      </OrbitingCircles>
    </div>
  )
}

function FeatureCard({ feature }: { feature: Feature }) {
  const iconHover = useIconHover()
  return (
    <div
      onMouseEnter={iconHover.onMouseEnter}
      onMouseLeave={iconHover.onMouseLeave}
      className="tb-card tb-card-interactive group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-6"
    >
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {feature.renderIcon(iconHover.ref)}
      </span>
      <h3 className="mt-4 font-heading text-lg font-semibold tracking-tight">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm text-pretty text-muted-foreground">
        {feature.body}
      </p>
      {feature.visual === "orbit" ? <OrbitVisual /> : null}
      {feature.beam ? <BorderBeam duration={9} borderWidth={1.5} /> : null}
    </div>
  )
}

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Features"
        title="Everything you need to run your day"
        subtitle="Plan, schedule, and reflect without leaving the keyboard — or the page."
      />
      <div className="mt-12 grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-4 md:grid-cols-4">
        {FEATURES.map((feature, i) => (
          <BlurFade
            key={feature.title}
            delay={0.04 * i}
            direction="right"
            inView
            className={cn(feature.className)}
          >
            <FeatureCard feature={feature} />
          </BlurFade>
        ))}
      </div>
    </section>
  )
}
