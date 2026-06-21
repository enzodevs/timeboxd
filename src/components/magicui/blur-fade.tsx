import { useRef } from "react"
import type { ReactNode } from "react"
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react"
import type { UseInViewOptions, Variants } from "motion/react"

type MarginType = UseInViewOptions["margin"]

interface BlurFadeProps {
  children: ReactNode
  className?: string
  variant?: {
    hidden: { y: number }
    visible: { y: number }
  }
  duration?: number
  delay?: number
  offset?: number
  direction?: "up" | "down" | "left" | "right"
  inView?: boolean
  inViewMargin?: MarginType
  blur?: string
}

export function BlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  offset = 6,
  direction = "down",
  inView = false,
  inViewMargin = "-50px",
  blur = "6px",
}: BlurFadeProps) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin })
  const isInView = !inView || inViewResult
  const axis = direction === "left" || direction === "right" ? "x" : "y"
  const defaultVariants: Variants = reduced
    ? {
        hidden: { opacity: 1, filter: "blur(0px)", [axis]: 0 },
        visible: { opacity: 1, filter: "blur(0px)", [axis]: 0 },
      }
    : {
        hidden: {
          [axis]: direction === "right" || direction === "down" ? -offset : offset,
          opacity: 0,
          filter: `blur(${blur})`,
        },
        visible: { [axis]: 0, opacity: 1, filter: "blur(0px)" },
      }
  const combinedVariants = variant || defaultVariants
  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        exit="hidden"
        variants={combinedVariants}
        transition={{
          delay: 0.04 + delay,
          duration,
          ease: "easeOut",
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
