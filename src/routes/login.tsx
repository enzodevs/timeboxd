import * as React from "react"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import {
  ArrowLeftIcon,
  EnvelopeSimpleIcon,
  MagicWandIcon,
  PaperPlaneTiltIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { signIn } from "@/lib/auth-client"
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
      {/* Animated aurora gradient backdrop — pure CSS, works on every browser. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4c1d95 100%)",
          }}
        />
        <div className="tb-aurora tb-aurora-a" />
        <div className="tb-aurora tb-aurora-b" />
        <div className="tb-aurora tb-aurora-c" />
        {/* Readability scrim — stronger under the form column on desktop. */}
        <div className="absolute inset-0 bg-background/50 lg:right-1/2 lg:bg-background/35" />
        <style>{`
          .tb-aurora{position:absolute;border-radius:9999px;filter:blur(70px);opacity:.6;mix-blend-mode:screen;will-change:transform}
          .tb-aurora-a{width:55vmax;height:55vmax;left:42%;top:-12%;background:radial-gradient(circle at center,#7c3aed,transparent 60%);animation:tb-drift-a 19s ease-in-out infinite alternate}
          .tb-aurora-b{width:46vmax;height:46vmax;left:58%;top:38%;background:radial-gradient(circle at center,#ec4899,transparent 60%);animation:tb-drift-b 23s ease-in-out infinite alternate}
          .tb-aurora-c{width:50vmax;height:50vmax;left:30%;top:55%;background:radial-gradient(circle at center,#4f46e5,transparent 60%);animation:tb-drift-c 27s ease-in-out infinite alternate}
          @keyframes tb-drift-a{from{transform:translate(-10%,-5%) scale(1)}to{transform:translate(15%,12%) scale(1.2)}}
          @keyframes tb-drift-b{from{transform:translate(6%,-10%) scale(1.1)}to{transform:translate(-16%,6%) scale(.9)}}
          @keyframes tb-drift-c{from{transform:translate(-6%,6%) scale(1)}to{transform:translate(12%,-10%) scale(1.15)}}
          @media (prefers-reduced-motion:reduce){.tb-aurora{animation:none}}
        `}</style>
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Left — auth card */}
        <div className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-card/70 p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8 dark:bg-card/55">
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
