import { Link } from "@tanstack/react-router"
import { ArrowRightIcon, GithubLogoIcon } from "@phosphor-icons/react"

import { BlurFade } from "@/components/magicui/blur-fade"
import { DotPattern } from "@/components/magicui/dot-pattern"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { SITE } from "./site"

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <BlurFade inView>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center sm:py-20">
          <DotPattern
            width={22}
            height={22}
            className="[mask-image:radial-gradient(420px_circle_at_center,white,transparent)] opacity-50"
          />
          <div
            aria-hidden
            className="absolute bottom-[-40%] left-1/2 -z-0 h-[360px] w-[640px] -translate-x-1/2 rounded-full bg-primary/15 blur-[110px]"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Start boxing your time today
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-pretty text-muted-foreground">
              No account, no setup. Open the app and turn today's to-do list into
              a plan you'll actually follow.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <RainbowButton asChild size="lg">
                <Link to={SITE.appPath}>
                  Launch app
                  <ArrowRightIcon className="size-4" />
                </Link>
              </RainbowButton>
              <a
                href={SITE.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-base font-medium transition hover:bg-muted"
              >
                <GithubLogoIcon className="size-5" />
                View source
              </a>
            </div>
          </div>
        </div>
      </BlurFade>
    </section>
  )
}
