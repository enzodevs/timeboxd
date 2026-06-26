import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

interface BorderBeamProps {
  /** Seconds for one full lap around the border. */
  duration?: number
  /** Negative offset so multiple beams can be staggered. */
  delay?: number
  colorFrom?: string
  colorTo?: string
  /** Border thickness in px. */
  borderWidth?: number
  /** Width of the bright arc, in degrees of the conic sweep. */
  arc?: number
  className?: string
}

/**
 * A light that travels around an element's border.
 *
 * Implementation: a conic-gradient disc is rotated by `motion`, and the wrapper
 * is masked to show only the border ring (padding-box exclude). This avoids the
 * brittle `offset-path: rect()` + `mask-composite: intersect` combo, which can
 * render as a static block instead of a moving beam.
 *
 * Drop it inside any `position: relative; rounded-*` container.
 */
export function BorderBeam({
  duration = 7,
  delay = 0,
  colorFrom = "var(--color-1)",
  colorTo = "var(--color-3)",
  borderWidth = 1.5,
  arc = 70,
  className,
}: BorderBeamProps) {
  const start = 360 - arc
  const reduced = useReducedMotion()
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
        className
      )}
      style={{
        padding: borderWidth,
        WebkitMask:
          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        maskComposite: "exclude",
        boxSizing: "border-box",
      }}
    >
      <motion.div
        aria-hidden
        className="absolute top-1/2 left-1/2 h-[150%] w-[150%] rounded-full"
        style={{
          translateX: "-50%",
          translateY: "-50%",
          background: `conic-gradient(from 0deg, transparent 0deg ${start}deg, ${colorFrom} ${start + arc * 0.35}deg, ${colorTo} ${start + arc * 0.85}deg, transparent 360deg)`,
        }}
        initial={{ rotate: 0 }}
        animate={reduced ? { rotate: 0 } : { rotate: 360 }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration, ease: "linear", repeat: Infinity, delay: -delay }
        }
      />
    </div>
  )
}
