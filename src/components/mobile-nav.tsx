import * as React from "react"
import { Link } from "@tanstack/react-router"
import { XIcon, ListIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Portal, PortalBackdrop } from "@/components/portal"
import { navLinks } from "@/components/header"
import { SITE } from "@/components/landing/site"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const toggleRef = React.useRef<HTMLButtonElement>(null)
  // Close and return focus to the toggle (shared by Esc + backdrop + links).
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
        {open ? (
          <XIcon className="size-4.5" />
        ) : (
          <ListIcon className="size-4.5" />
        )}
      </Button>
      {open && (
        <Portal className="top-14" id="mobile-menu">
          <PortalBackdrop data-state="open" onClick={close} />
          <div
            className={cn(
              "ease-out data-[slot=open]:animate-in data-[slot=open]:zoom-in-97",
              "size-full p-4"
            )}
            data-slot="open"
          >
            <div className="grid gap-y-1">
              {navLinks.map((link) => (
                <Button
                  asChild
                  className="justify-start"
                  key={link.label}
                  variant="ghost"
                  onClick={close}
                >
                  <a href={link.href}>{link.label}</a>
                </Button>
              ))}
            </div>
            <div className="mt-12 flex flex-col gap-2">
              <Button
                asChild
                className="w-full"
                variant="outline"
                onClick={close}
              >
                <a href={SITE.githubUrl} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </Button>
              <Button asChild className="w-full" onClick={close}>
                <Link to={SITE.appPath}>Launch app</Link>
              </Button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
