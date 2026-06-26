import * as React from "react"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import {
  ArrowLeftIcon,
  EnvelopeSimpleIcon,
  MagicWandIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { signIn, signUp } from "@/lib/auth-client"
import { getSession } from "@/server/session"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/app",
  }),
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: "/app" })
    }
  },
  component: LoginPage,
})

/** Official multi-color Google "G". */
function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch()
  const [email, setEmail] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [magicSent, setMagicSent] = React.useState(false)

  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/app"
  // Magic link stays visually disabled until an email provider (RESEND_API_KEY)
  // is configured. Flip the build-time flag VITE_MAGIC_LINK_ENABLED=true to enable.
  const magicLinkEnabled = import.meta.env.VITE_MAGIC_LINK_ENABLED === "true"

  async function continueWithGoogle() {
    setSubmitting(true)
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: safeRedirect,
      })
      if (result.error) {
        toast.error(result.error.message ?? "Google sign-in is unavailable")
        setSubmitting(false)
      }
      // On success the browser is redirected to Google — nothing more to do here.
    } catch {
      toast.error("Google sign-in is unavailable")
      setSubmitting(false)
    }
  }

  // Local-only escape hatch: sign in with a seeded email/password account so
  // you can test without Google OAuth configured. `import.meta.env.DEV` is
  // statically false in production builds, so this whole path is tree-shaken out.
  async function continueAsDev() {
    setSubmitting(true)
    const creds = {
      email: "dev@timeboxd.local",
      password: "dev-password-123",
      name: "Dev User",
    }
    try {
      const created = await signUp.email(creds)
      if (created.error) {
        // Most likely the account already exists — just sign in.
        const signed = await signIn.email({
          email: creds.email,
          password: creds.password,
        })
        if (signed.error) {
          toast.error(signed.error.message ?? "Dev sign-in failed")
          setSubmitting(false)
          return
        }
      }
      // Full navigation so the SSR loader picks up the new session cookie.
      window.location.href = safeRedirect
    } catch {
      toast.error("Dev sign-in failed")
      setSubmitting(false)
    }
  }

  async function sendMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting || !magicLinkEnabled) return
    if (!email) {
      toast.error("Enter your email first")
      return
    }
    setSubmitting(true)
    try {
      const result = await signIn.magicLink({
        email,
        callbackURL: safeRedirect,
      })
      if (result.error) {
        toast.error(result.error.message ?? "Couldn't send the magic link")
        return
      }
      setMagicSent(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Branded aurora backdrop — pure CSS. Emerald brand glow (driven by
          --primary so it tracks the theme) over a deep emerald-tinted base.
          Transform-only animation, reduced-motion safe. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(150deg, oklch(0.21 0.03 166) 0%, oklch(0.16 0.024 168) 52%, oklch(0.12 0.018 172) 100%)",
          }}
        />
        <div className="tb-aurora tb-aurora-a" />
        <div className="tb-aurora tb-aurora-b" />
        <div className="tb-aurora tb-aurora-c" />
        {/* Vignette — pulls focus to the centre, softens the edges. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 38%, transparent 34%, rgba(0,0,0,0.45) 100%)",
          }}
        />
        <style>{`
          .tb-aurora{position:absolute;border-radius:9999px;filter:blur(80px);opacity:.5;mix-blend-mode:screen;will-change:transform}
          .tb-aurora-a{width:55vmax;height:55vmax;left:38%;top:-15%;background:radial-gradient(circle at center,var(--primary),transparent 60%);animation:tb-drift-a 21s ease-in-out infinite alternate}
          .tb-aurora-b{width:48vmax;height:48vmax;left:60%;top:40%;background:radial-gradient(circle at center,oklch(0.74 0.12 188),transparent 60%);animation:tb-drift-b 25s ease-in-out infinite alternate}
          .tb-aurora-c{width:52vmax;height:52vmax;left:24%;top:58%;background:radial-gradient(circle at center,oklch(0.6 0.14 158),transparent 62%);animation:tb-drift-c 29s ease-in-out infinite alternate}
          @keyframes tb-drift-a{from{transform:translate(-10%,-5%) scale(1)}to{transform:translate(14%,12%) scale(1.18)}}
          @keyframes tb-drift-b{from{transform:translate(6%,-10%) scale(1.1)}to{transform:translate(-15%,6%) scale(.92)}}
          @keyframes tb-drift-c{from{transform:translate(-6%,6%) scale(1)}to{transform:translate(12%,-10%) scale(1.14)}}
          @media (prefers-reduced-motion:reduce){.tb-aurora{animation:none}}
        `}</style>
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Left — auth card */}
        <div className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-card/75 p-6 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/10 backdrop-blur-2xl sm:p-8 dark:bg-card/60">
            <div className="mb-6 flex items-center gap-3">
              <img
                src="/timebox-icon.webp"
                alt=""
                width={40}
                height={40}
                className="size-10 object-contain"
              />
              <div>
                <h1 className="font-heading text-xl font-semibold">timeboxd</h1>
                <p className="text-sm text-muted-foreground">
                  Sign in or create your account
                </p>
              </div>
            </div>

            {magicSent ? (
              <div className="rounded-xl border border-border bg-muted/40 p-5 text-center">
                <PaperPlaneTiltIcon className="mx-auto mb-3 size-8 text-primary" />
                <p className="font-medium">Check your inbox</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We sent a sign-in link to <strong>{email}</strong>. Open it on
                  this device to continue.
                </p>
                <button
                  type="button"
                  onClick={() => setMagicSent(false)}
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full border-border bg-card/60 hover:bg-card"
                  onClick={continueWithGoogle}
                  disabled={submitting}
                >
                  <GoogleG className="size-5" />
                  Continue with Google
                </Button>

                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  or
                  <span className="h-px flex-1 bg-border" />
                </div>

                <form
                  className={`space-y-4 ${magicLinkEnabled ? "" : "opacity-55"}`}
                  onSubmit={sendMagicLink}
                  aria-disabled={!magicLinkEnabled}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email">Email</Label>
                      {magicLinkEnabled ? null : (
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                          Soon
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <EnvelopeSimpleIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-8"
                        placeholder="you@example.com"
                        autoComplete="email"
                        required={magicLinkEnabled}
                        disabled={!magicLinkEnabled}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={submitting || !magicLinkEnabled}
                  >
                    <MagicWandIcon />
                    {submitting ? "Sending..." : "Email me a magic link"}
                  </Button>
                </form>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  {magicLinkEnabled
                    ? "No passwords. We email you a secure one-time link to sign in."
                    : "Email magic links are coming soon — continue with Google for now."}
                </p>
              </>
            )}

            <div className="mt-6 text-center text-xs text-muted-foreground">
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <ArrowLeftIcon className="size-3" />
                Back to landing
              </Link>
            </div>

            {import.meta.env.DEV ? (
              <div className="mt-5 border-t border-dashed border-border/70 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={continueAsDev}
                  disabled={submitting}
                >
                  Continue as dev user
                </Button>
                <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
                  Local dev only · bypasses OAuth
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right — branded panel over the gradient (desktop only) */}
        <div className="relative hidden items-center justify-center p-10 lg:flex">
          <div className="max-w-md text-white">
            <h2 className="font-heading text-4xl leading-tight font-semibold drop-shadow-lg">
              Plan your day, one box at a time.
            </h2>
            <p className="mt-4 text-lg text-white/80 drop-shadow">
              Drag tasks onto a timeline, focus on what matters, and watch the
              day fall into place.
            </p>
            <div className="mt-8 grid gap-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-sm text-white/70">Today</p>
                <p className="mt-1 font-medium">Deep work · 09:00 – 11:00</p>
              </div>
              <div className="ml-8 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                <p className="text-sm text-white/70">Focus</p>
                <p className="mt-1 font-medium">No context switching</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
