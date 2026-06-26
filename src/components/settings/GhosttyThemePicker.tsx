import { useEffect, useMemo, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { useVirtualizer } from "@tanstack/react-virtual"
import {
  CaretUpDownIcon,
  CheckIcon,
  ClockCounterClockwiseIcon,
  MagnifyingGlassIcon,
  PaletteIcon,
  StarIcon,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  clearGhosttyTheme,
  getActiveGhosttyTheme,
  getGhosttyTheme,
  GHOSTTY_THEMES,
  setGhosttyTheme,
} from "@/themes/ghostty-theme"
import type { GhosttyThemeMeta } from "@/themes/ghostty-theme"

/** Curated "famous" terminal themes (verified to exist in the index), most
 * recognizable first. Surfaced as a Popular section so the 438-item list isn't
 * the only way in. */
const POPULAR_SLUGS = [
  "dracula",
  "catppuccin-mocha",
  "tokyonight",
  "nord",
  "gruvbox-dark",
  "catppuccin-latte",
  "rose-pine",
  "builtin-solarized-dark",
  "atom-one-dark",
  "monokai-pro",
  "github-dark",
  "everforest-dark-hard",
  "kanagawa-wave",
  "night-owl",
  "ayu-mirage",
  "snazzy",
] as const

const RECENTS_KEY = "ghostty-theme-recents"
const RECENTS_MAX = 6

function loadRecents(): string[] {
  if (typeof localStorage === "undefined") return []
  try {
    const raw = localStorage.getItem(RECENTS_KEY)
    const arr = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(arr) ? arr.filter((s): s is string => typeof s === "string") : []
  } catch {
    return []
  }
}

function pushRecent(slug: string): string[] {
  const next = [slug, ...loadRecents().filter((s) => s !== slug)].slice(0, RECENTS_MAX)
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable — recents just won't persist */
  }
  return next
}

/** Two-tone preview chip for a theme (background + foreground). */
function Swatch({ bg, fg, size = 4 }: { bg: string; fg: string; size?: 4 | 5 }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[4px] border border-border/60 font-bold",
        size === 5 ? "size-5 text-[10px]" : "size-4 text-[9px]"
      )}
      style={{ backgroundColor: bg, color: fg }}
      aria-hidden
    >
      A
    </span>
  )
}

// Flattened row model so the whole list (default + section headers + ~440
// themes) is one virtualized scroll container — only the visible window mounts.
type Row =
  | { type: "default" }
  | { type: "header"; label: string; kind?: "recent" | "popular" }
  | { type: "item"; theme: GhosttyThemeMeta }

const isSelectable = (r: Row) => r.type !== "header"

/**
 * Searchable picker for all Ghostty themes, in a roomy command-style dialog.
 *
 * The list is static (built at compile time — no fetch) and virtualized with
 * @tanstack/react-virtual: with 400+ themes, mounting them all was slow. A
 * dialog (vs. a popover anchored to the trigger) gives a stable, definite
 * height so the virtualizer measures correctly on open, plus room for the
 * Recently used / Popular shortcuts. Selecting one re-skins the app via shadcn
 * token overrides; "Default" returns to the built-in theme. See
 * docs/ghostty-theming.md.
 */
export function GhosttyThemePicker() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [recents, setRecents] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const { setTheme } = useTheme()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActive(getActiveGhosttyTheme())
  }, [])

  const { dark, light } = useMemo(
    () => ({
      dark: GHOSTTY_THEMES.filter((t) => t.appearance === "dark"),
      light: GHOSTTY_THEMES.filter((t) => t.appearance === "light"),
    }),
    []
  )

  const popular = useMemo(
    () =>
      POPULAR_SLUGS.map((s) => getGhosttyTheme(s)).filter(
        (t): t is GhosttyThemeMeta => Boolean(t)
      ),
    []
  )

  const rows = useMemo<Row[]>(() => {
    const q = query.trim().toLowerCase()
    const match = (t: GhosttyThemeMeta) =>
      !q || t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
    const out: Row[] = []

    if (!q) {
      // Browse view: shortcuts first, then the full A–Z list by appearance.
      out.push({ type: "default" })
      const recentThemes = recents
        .map((s) => getGhosttyTheme(s))
        .filter((t): t is GhosttyThemeMeta => Boolean(t))
      if (recentThemes.length) {
        out.push({ type: "header", label: "Recently used", kind: "recent" })
        for (const t of recentThemes) out.push({ type: "item", theme: t })
      }
      if (popular.length) {
        out.push({ type: "header", label: "Popular", kind: "popular" })
        for (const t of popular) out.push({ type: "item", theme: t })
      }
      out.push({ type: "header", label: `All dark (${dark.length})` })
      for (const t of dark) out.push({ type: "item", theme: t })
      out.push({ type: "header", label: `All light (${light.length})` })
      for (const t of light) out.push({ type: "item", theme: t })
      return out
    }

    // Search view: flat matched results.
    if ("default built-in".includes(q)) out.push({ type: "default" })
    const darkF = dark.filter(match)
    const lightF = light.filter(match)
    if (darkF.length) {
      out.push({ type: "header", label: `Dark (${darkF.length})` })
      for (const t of darkF) out.push({ type: "item", theme: t })
    }
    if (lightF.length) {
      out.push({ type: "header", label: `Light (${lightF.length})` })
      for (const t of lightF) out.push({ type: "item", theme: t })
    }
    return out
  }, [query, dark, light, popular, recents])

  // Keep the keyboard cursor on a selectable row whenever the list changes.
  useEffect(() => {
    setActiveIndex(rows.findIndex(isSelectable))
  }, [rows])

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => (rows[i]?.type === "header" ? 30 : 40),
    overscan: 12,
    // Seed a non-zero viewport so the first paint (during the open animation,
    // before the scroll element is measured) still renders the visible window.
    initialRect: { width: 560, height: 460 },
  })

  // On open, jump to the active theme so the current choice is visible.
  useEffect(() => {
    if (!open) return
    const idx = rows.findIndex((r) =>
      r.type === "item"
        ? r.theme.slug === active
        : r.type === "default" && active === null
    )
    if (idx >= 0) {
      setActiveIndex(idx)
      virtualizer.scrollToIndex(idx, { align: "center" })
    }
    // Intentionally only re-runs when the dialog transitions open.
  }, [open])

  const activeMeta = active ? getGhosttyTheme(active) : undefined

  function select(slug: string | null) {
    if (slug === null) {
      clearGhosttyTheme()
      setActive(null)
    } else {
      setGhosttyTheme(slug)
      setActive(slug)
      setRecents(pushRecent(slug))
      // keep next-themes in agreement so built-in dark: utilities + the
      // Light/Dark buttons reflect the active theme's appearance.
      const meta = getGhosttyTheme(slug)
      if (meta) setTheme(meta.appearance)
    }
    setOpen(false)
  }

  function commit(index: number) {
    const row = rows[index]
    if (!row) return
    if (row.type === "default") select(null)
    else if (row.type === "item") select(row.theme.slug)
  }

  function move(dir: 1 | -1) {
    const n = rows.length
    if (!n) return
    for (let k = 1; k <= n; k++) {
      const i = ((activeIndex + dir * k) % n + n) % n
      if (isSelectable(rows[i]!)) {
        setActiveIndex(i)
        virtualizer.scrollToIndex(i, { align: "auto" })
        break
      }
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      move(1)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      move(-1)
    } else if (e.key === "Enter") {
      e.preventDefault()
      commit(activeIndex)
    }
    // Escape falls through to the dialog so it closes.
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) {
          setQuery("")
          setRecents(loadRecents())
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="flex min-w-0 items-center gap-2">
            {activeMeta ? (
              <Swatch bg={activeMeta.bg} fg={activeMeta.fg} />
            ) : (
              <PaletteIcon className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">
              {activeMeta ? activeMeta.name : "Default (built-in)"}
            </span>
          </span>
          <CaretUpDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="flex max-h-[80dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <DialogTitle className="sr-only">Choose a Ghostty theme</DialogTitle>
        <DialogDescription className="sr-only">
          Search and apply one of {GHOSTTY_THEMES.length} terminal-inspired
          themes, or pick a popular or recently used one.
        </DialogDescription>

        <div className="flex items-center gap-2 border-b border-border px-4">
          <MagnifyingGlassIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search 438 themes…"
            aria-label="Search themes"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div
          ref={scrollRef}
          role="listbox"
          aria-label="Ghostty themes"
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-1.5"
        >
          {rows.length === 0 ? (
            <p className="px-3 py-12 text-center text-sm text-muted-foreground">
              No theme matches “{query.trim()}”.
            </p>
          ) : (
            <div
              style={{
                height: virtualizer.getTotalSize(),
                position: "relative",
                width: "100%",
              }}
            >
              {virtualizer.getVirtualItems().map((v) => {
                const row = rows[v.index]!
                const focused = v.index === activeIndex
                return (
                  <div
                    key={v.key}
                    data-index={v.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${v.start}px)`,
                    }}
                  >
                    {row.type === "header" ? (
                      <div className="flex items-center gap-1.5 px-2 pt-3 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                        {row.kind === "recent" && (
                          <ClockCounterClockwiseIcon className="size-3.5" />
                        )}
                        {row.kind === "popular" && (
                          <StarIcon weight="fill" className="size-3.5 text-primary" />
                        )}
                        {row.label}
                      </div>
                    ) : (
                      <button
                        type="button"
                        role="option"
                        aria-selected={focused}
                        onMouseEnter={() => setActiveIndex(v.index)}
                        onClick={() => commit(v.index)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm outline-none transition-colors",
                          focused
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground"
                        )}
                      >
                        {row.type === "default" ? (
                          <>
                            <PaletteIcon className="size-5 shrink-0 text-muted-foreground" />
                            <span className="flex-1">Default (built-in)</span>
                            {active === null && (
                              <CheckIcon className="size-4 shrink-0 text-primary" />
                            )}
                          </>
                        ) : (
                          <>
                            <Swatch bg={row.theme.bg} fg={row.theme.fg} size={5} />
                            <span className="flex-1 truncate">{row.theme.name}</span>
                            {active === row.theme.slug && (
                              <CheckIcon className="size-4 shrink-0 text-primary" />
                            )}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <span className="tabular-nums">{GHOSTTY_THEMES.length} themes</span>
          <span className="hidden sm:inline">
            ↑↓ navigate · ↵ apply · esc close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
