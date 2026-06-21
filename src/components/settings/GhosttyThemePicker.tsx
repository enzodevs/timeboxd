import { useEffect, useMemo, useState } from "react"
import { useTheme } from "next-themes"
import { CaretUpDownIcon, CheckIcon, PaletteIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  clearGhosttyTheme,
  getActiveGhosttyTheme,
  getGhosttyTheme,
  GHOSTTY_THEMES,
  setGhosttyTheme,
} from "@/themes/ghostty-theme"

/** Two-tone preview chip for a theme (background + foreground). */
function Swatch({ bg, fg }: { bg: string; fg: string }) {
  return (
    <span
      className="flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-border/60 text-[9px] font-bold"
      style={{ backgroundColor: bg, color: fg }}
      aria-hidden
    >
      A
    </span>
  )
}

/**
 * Searchable picker for all 438 Ghostty themes. Selecting one re-skins the
 * whole app via shadcn token overrides; "Default" returns to the built-in
 * light/dark theme. Drop anywhere inside Settings — see docs/ghostty-theming.md.
 */
export function GhosttyThemePicker() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const { setTheme } = useTheme()

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

  const activeMeta = active ? getGhosttyTheme(active) : undefined

  function select(slug: string | null) {
    if (slug === null) {
      clearGhosttyTheme()
      setActive(null)
    } else {
      setGhosttyTheme(slug)
      setActive(slug)
      // keep next-themes in agreement so built-in dark: utilities + the
      // Light/Dark buttons reflect the active theme's appearance.
      const meta = getGhosttyTheme(slug)
      if (meta) setTheme(meta.appearance)
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search themes…" />
          <CommandList>
            <CommandEmpty>No theme found.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="default built-in" onSelect={() => select(null)}>
                <PaletteIcon className="size-4 text-muted-foreground" />
                <span className="flex-1">Default (built-in)</span>
                {active === null && <CheckIcon className="size-4" />}
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading={`Dark (${dark.length})`}>
              {dark.map((t) => (
                <CommandItem
                  key={t.slug}
                  value={`${t.name} ${t.slug}`}
                  onSelect={() => select(t.slug)}
                >
                  <Swatch bg={t.bg} fg={t.fg} />
                  <span className="flex-1 truncate">{t.name}</span>
                  {active === t.slug && <CheckIcon className="size-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading={`Light (${light.length})`}>
              {light.map((t) => (
                <CommandItem
                  key={t.slug}
                  value={`${t.name} ${t.slug}`}
                  onSelect={() => select(t.slug)}
                >
                  <Swatch bg={t.bg} fg={t.fg} />
                  <span className="flex-1 truncate">{t.name}</span>
                  {active === t.slug && <CheckIcon className="size-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
