import type { Timebox } from "@/db/schema"

/**
 * Named accent colors for timeboxes. oklch values so they read well tinted into
 * either a light or a dark card via `color-mix`. The brand `--timebox` palette
 * stays separate; these drive per-box variety.
 */
export const BOX_COLORS = {
  emerald: "oklch(0.72 0.15 162)",
  blue: "oklch(0.62 0.17 250)",
  violet: "oklch(0.6 0.2 300)",
  amber: "oklch(0.78 0.15 80)",
  rose: "oklch(0.65 0.21 12)",
  teal: "oklch(0.72 0.12 195)",
  orange: "oklch(0.7 0.17 50)",
  slate: "oklch(0.62 0.04 250)",
} as const

export type BoxColorName = keyof typeof BOX_COLORS
export const BOX_COLOR_NAMES = Object.keys(BOX_COLORS) as BoxColorName[]

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * Resolve a timebox's accent color: an explicit choice wins, then a stable
 * tag-derived hue (so categories stay visually consistent), then a deep-work
 * violet, falling back to the brand emerald.
 */
export function resolveBoxColor(
  box: Pick<Timebox, "color" | "deepWork" | "tags">
): string {
  if (box.color) {
    if (box.color in BOX_COLORS) return BOX_COLORS[box.color as BoxColorName]
    // Allow a raw CSS color too (e.g. imported from elsewhere).
    if (/^(#|oklch|hsl|rgb)/.test(box.color)) return box.color
  }
  const tag = box.tags[0]
  if (tag) return BOX_COLORS[BOX_COLOR_NAMES[hash(tag) % BOX_COLOR_NAMES.length]!]
  if (box.deepWork) return BOX_COLORS.violet
  return BOX_COLORS.emerald
}
