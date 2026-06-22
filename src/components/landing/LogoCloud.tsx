import {
  CalendarDotsIcon,
  CheckSquareIcon,
  DatabaseIcon,
  HandGrabbingIcon,
  NoteIcon,
  PaintBrushIcon,
  StackIcon,
  TreeStructureIcon,
} from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"

import { BlurFade } from "@/components/magicui/blur-fade"
import { Marquee } from "@/components/magicui/marquee"

const STACK: { label: string; icon: Icon }[] = [
  { label: "TanStack Start", icon: StackIcon },
  { label: "Tailwind v4", icon: PaintBrushIcon },
  { label: "Drizzle ORM", icon: TreeStructureIcon },
  { label: "SQLite · libSQL", icon: DatabaseIcon },
  { label: "dnd-kit", icon: HandGrabbingIcon },
  { label: "TipTap", icon: NoteIcon },
  { label: "Google Calendar", icon: CalendarDotsIcon },
  { label: "Google Tasks", icon: CheckSquareIcon },
]

export function LogoCloud() {
  return (
    <section className="border-y border-border/60 bg-muted/20 py-10">
      <BlurFade inView>
        <p className="text-center text-sm font-medium text-muted-foreground">
          Built on tools you already trust
        </p>
      </BlurFade>
      <div className="relative mt-6">
        <Marquee pauseOnHover className="[--duration:32s]">
          {STACK.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="mx-2 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground"
            >
              <Icon weight="duotone" className="size-4 text-primary" />
              {label}
            </div>
          ))}
        </Marquee>
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  )
}
