import * as React from "react"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import {
  EnvelopeSimpleIcon,
  LockKeyIcon,
  SignInIcon,
  UserIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { signIn, signUp } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
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

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch()
  const [mode, setMode] = React.useState<"in" | "up">("in")
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/app"

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const result =
        mode === "in"
          ? await signIn.email({ email, password })
          : await signUp.email({
              email,
              password,
              name: name.trim() || email,
            })

      if (result.error) {
        toast.error(result.error.message ?? "Authentication failed")
        return
      }
      window.location.assign(safeRedirect)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="landing-surface flex min-h-screen items-center justify-center px-4 py-10 text-foreground">
      <section className="tb-card w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-[var(--elevation-low)]">
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
              {mode === "in" ? "Sign in to continue" : "Create your account"}
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-lg border border-border bg-muted/40 p-1">
          {[
            ["in", "Sign in"],
            ["up", "Sign up"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value as "in" | "up")}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition",
                mode === value
                  ? "bg-card text-foreground shadow-[var(--elevation-low)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={submit}>
          {mode === "up" ? (
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-8"
                  autoComplete="name"
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <EnvelopeSimpleIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-8"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <LockKeyIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-8"
                autoComplete={
                  mode === "in" ? "current-password" : "new-password"
                }
                minLength={8}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            <SignInIcon />
            {submitting
              ? "Working..."
              : mode === "in"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>

        <div className="mt-5 text-center text-xs text-muted-foreground">
          <Link to="/landing" className="text-primary hover:underline">
            Back to landing
          </Link>
        </div>
      </section>
    </main>
  )
}
