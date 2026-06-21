/**
 * Ghostty theme switching for timeboxd.
 *
 * Each Ghostty theme is a full re-skin of the shadcn token set, defined in
 * `ghostty-themes.css` as `:root[data-ghostty-theme="<slug>"]` blocks (higher
 * specificity than `.dark`/`:root`, so an active theme always wins). Switching
 * is just setting one data attribute — no runtime color math.
 *
 * Import the CSS once (e.g. in src/styles.css):  @import "./themes/ghostty-themes.css";
 *
 * See docs/ghostty-theming.md for full wiring instructions.
 */
import { GHOSTTY_THEMES } from "./themes-index"
import type { Appearance, GhosttyThemeMeta } from "./themes-index"

export { GHOSTTY_THEMES }
export type { Appearance, GhosttyThemeMeta }

const BY_SLUG = new Map(GHOSTTY_THEMES.map((t) => [t.slug, t]))

export const THEME_STORAGE_KEY = "ghostty-theme"
const APPEARANCE_STORAGE_KEY = "ghostty-theme-appearance"

export function getGhosttyTheme(slug: string): GhosttyThemeMeta | undefined {
  return BY_SLUG.get(slug)
}

/**
 * Activate a Ghostty theme: sets `data-ghostty-theme`, syncs the `.dark` class
 * (so Tailwind `dark:` utilities stay correct), and persists the choice.
 * No-op on the server.
 */
export function setGhosttyTheme(slug: string): void {
  if (typeof document === "undefined") return
  const meta = BY_SLUG.get(slug)
  if (!meta) {
    console.warn(`[ghostty-theme] unknown slug: ${slug}`)
    return
  }
  const root = document.documentElement
  root.dataset.ghosttyTheme = slug
  root.classList.toggle("dark", meta.appearance === "dark")
  root.style.colorScheme = meta.appearance
  try {
    localStorage.setItem(THEME_STORAGE_KEY, slug)
    localStorage.setItem(APPEARANCE_STORAGE_KEY, meta.appearance)
  } catch {
    /* storage unavailable — theme still applies for this session */
  }
}

/**
 * Remove the Ghostty override and fall back to the app's built-in light/dark
 * theme (next-themes). Does not touch the `.dark` class — let next-themes own
 * it again.
 */
export function clearGhosttyTheme(): void {
  if (typeof document === "undefined") return
  delete document.documentElement.dataset.ghosttyTheme
  try {
    localStorage.removeItem(THEME_STORAGE_KEY)
    localStorage.removeItem(APPEARANCE_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

/** Currently active slug, or null. */
export function getActiveGhosttyTheme(): string | null {
  if (typeof document === "undefined") return null
  return document.documentElement.dataset.ghosttyTheme ?? null
}

/** Re-apply the persisted theme. Call once on the client after mount. */
export function applyStoredGhosttyTheme(): void {
  if (typeof window === "undefined") return
  const slug = localStorage.getItem(THEME_STORAGE_KEY)
  if (slug) setGhosttyTheme(slug)
}

/**
 * Inline script (string) for the document <head>. Applies the persisted theme
 * before first paint to avoid a flash. Drop into __root.tsx — see docs.
 */
export const GHOSTTY_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');if(!s)return;var a=localStorage.getItem('${APPEARANCE_STORAGE_KEY}');var r=document.documentElement;r.dataset.ghosttyTheme=s;if(a){r.classList.toggle('dark',a==='dark');r.style.colorScheme=a;}}catch(e){}})();`
