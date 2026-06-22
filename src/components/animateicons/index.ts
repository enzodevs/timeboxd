// Vendored from github.com/Avijit07x/animateicons (MIT) — animated SVG icons
// built on motion/react. Source files live in ./lucide; this barrel re-exports
// them plus a small hook for triggering an icon from a parent hover target.
import * as React from "react"

export { GithubIcon } from "./lucide/github-icon"
export { MoonIcon } from "./lucide/moon-icon"
export { SunIcon } from "./lucide/sun-icon"
export { MenuIcon } from "./lucide/menu-icon"
export { MoveRightIcon } from "./lucide/move-right-icon"
export { LayersIcon } from "./lucide/layers-icon"
export { ZapIcon } from "./lucide/zap-icon"
export { BoxesIcon } from "./lucide/boxes-icon"
export { BoxIcon } from "./lucide/box-icon"
export { BookOpenTextIcon } from "./lucide/book-open-text-icon"
export { TerminalIcon } from "./lucide/terminal-icon"
export { ClipboardIcon } from "./lucide/clipboard-icon"
export { PlayIcon } from "./lucide/play-icon"

/** Common imperative handle every animateicons component exposes. */
export interface AnimatedIconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

/** Shared prop surface across the vendored icons. */
export interface AnimatedIconProps {
  size?: number
  className?: string
  color?: string
  duration?: number
  isAnimated?: boolean
}

export type AnimatedIcon = React.ForwardRefExoticComponent<
  AnimatedIconProps & React.RefAttributes<AnimatedIconHandle>
>

/**
 * Drive an icon's animation from a parent element (card, button, link) instead
 * of the icon's own hover area. Spread the returned handlers onto the hover
 * target and pass `ref` to the icon.
 */
export function useIconHover() {
  const ref = React.useRef<AnimatedIconHandle>(null)
  const onMouseEnter = React.useCallback(
    () => ref.current?.startAnimation(),
    []
  )
  const onMouseLeave = React.useCallback(() => ref.current?.stopAnimation(), [])
  return { ref, onMouseEnter, onMouseLeave }
}
