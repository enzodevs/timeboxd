import { cn } from "@/lib/utils"
import { SITE } from "./site"

interface LogoProps {
  className?: string
  showWordmark?: boolean
  /** Tailwind size for the icon, e.g. "size-8". */
  size?: string
}

/**
 * Brand mark for the landing page. The icon is a self-contained circular
 * mark (public/timebox-icon.webp) — the matching favicon set lives in public/.
 */
export function Logo({
  className,
  showWordmark = true,
  size = "size-8",
}: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <img
        src="/timebox-icon.webp"
        alt={showWordmark ? "" : SITE.brand}
        className={cn("shrink-0 object-contain", size)}
        width={32}
        height={32}
      />
      {showWordmark ? (
        <span className="font-heading text-lg font-semibold tracking-tight">
          {SITE.brand}
        </span>
      ) : null}
    </span>
  )
}
