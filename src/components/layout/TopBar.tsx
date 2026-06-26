import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { format } from "date-fns"
import { useTheme } from "next-themes"
import {
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
  DotsThreeVerticalIcon,
  GearSixIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SignOutIcon,
  SunIcon,
} from "@phosphor-icons/react"

import { signOut } from "@/lib/auth-client"
import { parseYmd, ymd } from "@/lib/time"
import { cn } from "@/lib/utils"
import { clearGhosttyTheme } from "@/themes/ghostty-theme"
import { OPEN_SEARCH_EVENT } from "@/components/search/CommandPalette"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TopBarProps {
  date: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onGoToDate: (date: string) => void
  onOpenSettings: () => void
  googleConnected?: boolean
}

const iconBtn =
  "flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"

export function TopBar({
  date,
  onPrev,
  onNext,
  onToday,
  onGoToDate,
  onOpenSettings,
  googleConnected,
}: TopBarProps) {
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useTheme()
  const [calOpen, setCalOpen] = React.useState(false)
  const d = parseYmd(date)
  const isToday = date === ymd(new Date())

  const openSearch = () =>
    window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT))

  const toggleTheme = () => {
    // Quick toggle returns to the built-in light/dark theme.
    clearGhosttyTheme()
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const logout = async () => {
    await signOut()
    await navigate({ to: "/login", search: { redirect: "/app" } })
  }

  return (
    <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border bg-background/80 px-3 backdrop-blur sm:px-4">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <img
          src="/timebox-icon.webp"
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0 object-contain"
        />
        <span className="hidden font-heading text-lg font-semibold tracking-tight sm:inline">
          timeboxd
        </span>
      </div>

      {/* Day navigator */}
      <div className="flex items-center gap-1 justify-self-center">
        <button
          type="button"
          aria-label="Previous day"
          onClick={onPrev}
          className={iconBtn}
        >
          <CaretLeftIcon className="size-4" />
        </button>
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              title="Pick a date"
              className="flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition hover:bg-muted data-[state=open]:bg-muted sm:min-w-[13rem]"
            >
              <CalendarBlankIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate tabular-nums sm:hidden">
                {format(d, "MMM d")}
              </span>
              <span className="hidden truncate tabular-nums sm:inline">
                {format(d, "EEEE, MMMM d")}
              </span>
              {isToday ? (
                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
                  Today
                </span>
              ) : null}
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={d}
              defaultMonth={d}
              onSelect={(day) => {
                if (day) {
                  onGoToDate(ymd(day))
                  setCalOpen(false)
                }
              }}
            />
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <span className="text-xs text-muted-foreground">
                {isToday ? "Today" : format(d, "EEE, MMM d")}
              </span>
              <button
                type="button"
                onClick={() => {
                  onToday()
                  setCalOpen(false)
                }}
                className="rounded-md px-2 py-1 text-xs font-medium text-primary transition hover:bg-muted"
              >
                Go to today
              </button>
            </div>
          </PopoverContent>
        </Popover>
        <button
          type="button"
          aria-label="Next day"
          onClick={onNext}
          className={iconBtn}
        >
          <CaretRightIcon className="size-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 justify-self-end">
        <button
          type="button"
          onClick={openSearch}
          className="hidden items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm text-muted-foreground shadow-xs transition hover:bg-muted hover:text-foreground sm:flex"
        >
          <MagnifyingGlassIcon className="size-4" />
          <span className="hidden md:inline">Search tasks, notes…</span>
          <kbd className="ml-1 hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] md:inline">
            ⌘K
          </kbd>
        </button>
        <button
          type="button"
          aria-label="Search"
          onClick={openSearch}
          className={cn(iconBtn, "sm:hidden")}
        >
          <MagnifyingGlassIcon className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className={cn(iconBtn, "max-sm:hidden")}
        >
          <SunIcon className="hidden size-4 dark:block" />
          <MoonIcon className="size-4 dark:hidden" />
        </button>
        <button
          type="button"
          aria-label="Settings"
          onClick={onOpenSettings}
          className={cn(iconBtn, "relative")}
        >
          <GearSixIcon className="size-4" />
          {googleConnected ? (
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
          ) : null}
        </button>
        <button
          type="button"
          aria-label="Sign out"
          onClick={() => void logout()}
          className={cn(iconBtn, "max-sm:hidden")}
        >
          <SignOutIcon className="size-4" />
        </button>

        {/* Mobile overflow: keeps the header from crowding on small screens. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="More"
              className={cn(iconBtn, "sm:hidden")}
            >
              <DotsThreeVerticalIcon weight="bold" className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={toggleTheme}>
              <SunIcon className="hidden dark:block" />
              <MoonIcon className="dark:hidden" />
              {resolvedTheme === "dark" ? "Light theme" : "Dark theme"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => void logout()}>
              <SignOutIcon />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
