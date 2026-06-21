import * as React from "react"
import type { CSSProperties, ReactNode } from "react"

import { cn } from "@/lib/utils"

interface OrbitingCirclesProps {
  className?: string
  children?: ReactNode
  /** Reverse the orbit direction. */
  reverse?: boolean
  /** Seconds for one full orbit. */
  duration?: number
  /** Orbit radius in px. */
  radius?: number
  /** Draw the orbit ring. */
  path?: boolean
  /** Size of each orbiting item in px. */
  iconSize?: number
  /** Multiplier on speed (2 = twice as fast). */
  speed?: number
}

/** Evenly spaces its children around a circular orbit and rotates them. */
export function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 20,
  radius = 100,
  path = true,
  iconSize = 40,
  speed = 1,
}: OrbitingCirclesProps) {
  const calculatedDuration = duration / speed
  const count = React.Children.count(children)
  return (
    <>
      {path ? (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full"
        >
          <circle
            className="stroke-border stroke-1 [stroke-dasharray:4_4]"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      ) : null}
      {React.Children.map(children, (child, index) => {
        const angle = (360 / count) * index
        return (
          <div
            style={
              {
                "--duration": calculatedDuration,
                "--radius": radius,
                "--angle": angle,
                "--icon-size": `${iconSize}px`,
              } as CSSProperties
            }
            className={cn(
              "absolute top-1/2 left-1/2 flex size-(--icon-size) -translate-x-1/2 -translate-y-1/2 transform-gpu animate-orbit items-center justify-center rounded-full",
              reverse && "[animation-direction:reverse]",
              className
            )}
          >
            {child}
          </div>
        )
      })}
    </>
  )
}
