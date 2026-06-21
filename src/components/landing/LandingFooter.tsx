import { Link } from "@tanstack/react-router"
import { GithubLogoIcon } from "@phosphor-icons/react"

import { Logo } from "./Logo"
import { SITE } from "./site"

const COLUMNS: { title: string; links: { label: string; href: string; to?: string; external?: boolean }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#workflow" },
      { label: "Pricing", href: "#pricing" },
      { label: "Launch app", href: SITE.appPath, to: SITE.appPath },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "GitHub", href: SITE.githubUrl, external: true },
      { label: "README", href: `${SITE.githubUrl}#readme`, external: true },
      { label: "License (MIT)", href: `${SITE.githubUrl}/blob/main/LICENSE`, external: true },
      { label: "FAQ", href: "#faq" },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {SITE.tagline} Open-source, local-first time-boxing for your day.
            </p>
            <a
              href={SITE.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <GithubLogoIcon className="size-5" />
              Star on GitHub
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold">{col.title}</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-muted-foreground transition hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ) : link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground transition hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <a
                        href={link.href}
                        className="text-muted-foreground transition hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {SITE.brand} · MIT licensed
          </p>
          <p>Built with TanStack Start &amp; Magic UI.</p>
        </div>
      </div>

      {/* faded wordmark watermark */}
      <div
        aria-hidden
        className="pointer-events-none select-none px-4 text-center font-heading text-[18vw] leading-none font-bold tracking-tighter text-foreground/[0.03]"
      >
        {SITE.brand}
      </div>
    </footer>
  )
}
