import * as React from "react"

import { cn } from "@/lib/utils"

interface SuccessCheckProps {
  checked: boolean
  /** Size + base color (e.g. "size-5 text-primary"). Fill uses currentColor. */
  className?: string
}

/**
 * A checkbox glyph that plays the transitions.dev "success check" celebration
 * (fade + rotate + Y-bob + stroke-draw) the moment it flips to checked — but
 * not on mount or when toggled back off. Unchecked shows an empty ring.
 *
 * The check path stays under 20 units long so the inherited
 * `stroke-dasharray: 20` from `.t-success-check svg path` draws it cleanly.
 */
export function SuccessCheck({ checked, className }: SuccessCheckProps) {
  const [animate, setAnimate] = React.useState(false)
  const prev = React.useRef(checked)

  // Detected during render so the very first checked frame is already the
  // animated (drawing-in) glyph — never a flash of the fully-drawn check.
  // Starts false on mount, so tasks that load already-completed don't replay.
  const justTurnedOn = checked && !prev.current
  const showAnimated = checked && (justTurnedOn || animate)

  React.useEffect(() => {
    prev.current = checked
    if (justTurnedOn) {
      setAnimate(true)
      const t = window.setTimeout(() => setAnimate(false), 650)
      return () => window.clearTimeout(t)
    }
  }, [checked, justTurnedOn])

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {/* empty ring — fades out as the check takes over */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn(
          "size-full transition-opacity duration-200",
          checked ? "opacity-0" : "opacity-100"
        )}
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      </svg>

      {checked &&
        (showAnimated ? (
          <span
            key="anim"
            data-state="in"
            className="t-success-check absolute inset-0"
            style={{
              // Tuned down from the 40px default for a small glyph.
              ["--check-y-amount" as string]: "6px",
              ["--check-blur-from" as string]: "4px",
            }}
          >
            <CheckGlyph />
          </span>
        ) : (
          <span key="static" className="absolute inset-0">
            <svg viewBox="0 0 24 24" fill="none" className="size-full">
              <circle cx="12" cy="12" r="10" fill="currentColor" />
              <path
                d="M7.5 12.5l3 3 5.5-6.5"
                stroke="var(--primary-foreground)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ))}
    </span>
  )
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-full">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="M7.5 12.5l3 3 5.5-6.5"
        stroke="var(--primary-foreground)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
