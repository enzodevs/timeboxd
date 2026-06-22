import * as React from "react"
import { Link } from "@tanstack/react-router"
import { useTheme } from "next-themes"
import {
  GithubIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
} from "@/components/animateicons"

import { cn } from "@/lib/utils"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { Logo } from "./Logo"
import { NAV_LINKS, SITE } from "./site"

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      {mounted && resolvedTheme === "dark" ? (
        <SunIcon size={16} className="size-full" />
      ) : (
        <MoonIcon size={16} className="size-full" />
      )}
    </button>
  )
}

export function LandingHeader() {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/60 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center">
          <Logo />
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <GithubIcon size={20} className="size-full" />
          </a>
          <RainbowButton asChild size="sm" className="hidden sm:inline-flex">
            <Link to={SITE.appPath}>Launch app</Link>
          </RainbowButton>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground md:hidden"
          >
            <MenuIcon size={20} className="size-full" />
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border/60 bg-background/95 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </a>
            ))}
            <Link
              to={SITE.appPath}
              className="mt-1 rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground"
            >
              Launch app
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
