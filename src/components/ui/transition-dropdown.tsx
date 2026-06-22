import * as React from "react"

import { cn } from "@/lib/utils"

type Origin =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"

interface TransitionDropdownProps
  extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean
  origin?: Origin
}

/**
 * Origin-aware "grow from the trigger" surface using the transitions.dev
 * menu-dropdown transition (`.t-dropdown` / `.is-open` / `.is-closing`).
 * Stays mounted through the close animation, then unmounts.
 */
export function TransitionDropdown({
  open,
  origin = "top-left",
  className,
  children,
  ...rest
}: TransitionDropdownProps) {
  const [render, setRender] = React.useState(open)
  const [openCls, setOpenCls] = React.useState(false)
  const [closing, setClosing] = React.useState(false)

  const closeMs = React.useMemo(() => {
    if (typeof window === "undefined") return 150
    const v = getComputedStyle(document.documentElement).getPropertyValue(
      "--dropdown-close-dur"
    )
    return parseFloat(v) || 150
  }, [])

  React.useEffect(() => {
    if (open) {
      setClosing(false)
      setRender(true)
      // Flip to the open state on the next frame so the transition runs
      // from the resting (scaled-down, transparent) base state.
      const raf = requestAnimationFrame(() => setOpenCls(true))
      return () => cancelAnimationFrame(raf)
    }
    setOpenCls(false)
    setClosing(true)
    const t = setTimeout(() => {
      setRender(false)
      setClosing(false)
    }, closeMs)
    return () => clearTimeout(t)
  }, [open, closeMs])

  if (!render) return null

  return (
    <div
      data-origin={origin}
      className={cn(
        "t-dropdown",
        openCls && "is-open",
        closing && "is-closing",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
