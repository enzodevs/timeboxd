import type { CSSProperties, ComponentPropsWithoutRef, FC } from "react"

import { cn } from "@/lib/utils"

interface AnimatedShinyTextProps extends ComponentPropsWithoutRef<"span"> {
  shimmerWidth?: number
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) => {
  return (
    <span
      style={
        {
          "--shiny-width": `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "mx-auto max-w-md text-muted-foreground/70",
        // Shine effect
        "animate-shiny-text [background-size:var(--shiny-width)_100%] [background-position:0_0] bg-no-repeat [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
        // Shine gradient
        "bg-gradient-to-r from-transparent via-foreground/80 via-50% to-transparent bg-clip-text",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
