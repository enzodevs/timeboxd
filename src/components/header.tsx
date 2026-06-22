"use client"
import * as React from "react"
import { Link } from "@tanstack/react-router"
import { useTheme } from "next-themes"

import { GithubIcon, MoonIcon, SunIcon } from "@/components/animateicons"
import { cn } from "@/lib/utils"
import { useScroll } from "@/hooks/use-scroll"
import { Button } from "@/components/ui/button"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { Logo } from "@/components/landing/Logo"
import { NAV_LINKS, SITE } from "@/components/landing/site"
import { MobileNav } from "@/components/mobile-nav"

// Re-exported so MobileNav shares the same nav source.
export const navLinks = NAV_LINKS

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

/**
 * Landing header built on the @efferd/header-2 block: a scroll-aware bar that
 * floats into a rounded, shadowed pill once you scroll past the hero. Wired to
 * timeboxd's brand, nav, theme toggle, GitHub link, and Launch app button.
 */
export function Header() {
  const scrolled = useScroll(10)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-6xl border-b border-transparent md:rounded-xl md:border md:transition-all md:duration-300 md:ease-out",
        {
          "border-border bg-background/95 shadow backdrop-blur-sm supports-backdrop-filter:bg-background/60 md:top-3 md:max-w-5xl":
            scrolled,
        }
      )}
    >
      <nav
        className={cn(
          "flex h-14 w-full items-center justify-between gap-4 px-4 md:transition-all md:duration-300 md:ease-out",
          { "md:px-3": scrolled }
        )}
      >
        <a href="#top" className="flex items-center rounded-md">
          <Logo />
        </a>

        <div className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => (
            <Button asChild key={link.label} size="sm" variant="ghost">
              <a href={link.href}>{link.label}</a>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hidden size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground sm:flex"
          >
            <GithubIcon size={20} className="size-full" />
          </a>
          <RainbowButton asChild size="sm" className="hidden sm:inline-flex">
            <Link to={SITE.appPath}>Launch app</Link>
          </RainbowButton>
          <MobileNav />
        </div>
      </nav>
    </header>
  )
}
