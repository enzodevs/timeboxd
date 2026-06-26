import * as React from "react"
import { Link } from "@tanstack/react-router"
import { CaretRightIcon, ListIcon, XIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { Portal } from "@/components/portal"
import { navLinks } from "@/components/header"
import { SITE } from "@/components/landing/site"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const toggleRef = React.useRef<HTMLButtonElement>(null)
  // Close and return focus to the toggle (shared by Esc + links).
  const close = React.useCallback(() => {
    setOpen(false)
    toggleRef.current?.focus()
  }, [])

  // Esc closes the open menu (focus returns via close()).
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, close])

  return (
    <div className="md:hidden">
      <Button
        ref={toggleRef}
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Toggle menu"
        className="md:hidden"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="outline"
      >
        {open ? <XIcon className="size-4.5" /> : <ListIcon className="size-4.5" />}
      </Button>
      {open && (
        <Portal className="top-14" id="mobile-menu">
          <div className="flex size-full flex-col bg-background duration-200 ease-out animate-in fade-in slide-in-from-top-1">
            {/* Large, tappable nav rows. */}
            <nav className="flex flex-col px-5 pt-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={close}
                  className="group flex items-center justify-between border-b border-border/60 py-4 font-heading text-2xl font-semibold tracking-tight outline-none transition-colors hover:text-primary focus-visible:text-primary active:text-primary"
                >
                  {link.label}
                  <CaretRightIcon className="size-5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </a>
              ))}
            </nav>

            {/* CTAs + footer pinned to the bottom, clear of the home indicator. */}
            <div
              className="mt-auto flex flex-col gap-3 p-5"
              style={{
                paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
              }}
            >
              <RainbowButton asChild className="w-full" onClick={close}>
                <Link to={SITE.appPath}>Launch app</Link>
              </RainbowButton>
              <Button asChild className="w-full" variant="outline" onClick={close}>
                <a href={SITE.githubUrl} target="_blank" rel="noreferrer">
                  View on GitHub
                </a>
              </Button>
              <p className="pt-2 text-center text-xs text-muted-foreground">
                Free &amp; open source · self-hosted
              </p>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
