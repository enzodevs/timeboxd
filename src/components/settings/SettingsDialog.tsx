import { useTheme } from "next-themes"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  CreditCardIcon,
  DesktopIcon,
  DownloadSimpleIcon,
  GoogleLogoIcon,
  LinkBreakIcon,
  MoonIcon,
  SunIcon,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { useBillingStatus } from "@/hooks/use-billing"
import { useGoogleActions, useGoogleStatus } from "@/hooks/use-google"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GhosttyThemePicker } from "@/components/settings/GhosttyThemePicker"
import { clearGhosttyTheme } from "@/themes/ghostty-theme"

const themes = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: DesktopIcon },
] as const

export function SettingsDialog({
  open,
  onOpenChange,
  readOnly,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  readOnly?: boolean
}) {
  const { theme, setTheme } = useTheme()
  const { data: status } = useGoogleStatus()
  const { data: billing } = useBillingStatus()
  const { connect, disconnect, importTasks } = useGoogleActions()
  const subscription = billing?.subscription
  const planName = billing?.selfHosted
    ? "Self-hosted"
    : (subscription?.lsProductName ??
      (billing?.hasActiveAccess ? "Cloud" : "No active subscription"))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Appearance and integrations for timeboxd.
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Appearance
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => {
              const Icon = t.icon
              const active = (theme ?? "system") === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    clearGhosttyTheme()
                    setTheme(t.value)
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-3 text-xs font-medium transition hover:bg-muted",
                    active && "border-primary ring-1 ring-primary/30"
                  )}
                >
                  <Icon className="size-5" />
                  {t.label}
                </button>
              )
            })}
          </div>
          <div className="space-y-1.5 pt-1">
            <p className="text-xs text-muted-foreground">Ghostty theme</p>
            <GhosttyThemePicker />
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Billing
          </h3>
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-2.5">
              <CreditCardIcon className="size-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{planName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {billing?.selfHosted
                    ? "Subscription checks are bypassed on this server"
                    : billing?.hasActiveAccess
                      ? "Cloud access is active"
                      : "Read-only until access is restored"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {subscription?.customerPortalUrl ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    window.location.href = subscription.customerPortalUrl!
                  }}
                >
                  <ArrowSquareOutIcon />
                  Manage billing
                </Button>
              ) : null}
              {!billing?.selfHosted ? (
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/pricing">View pricing</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Integrations
          </h3>
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-2.5">
              <GoogleLogoIcon className="size-5 shrink-0" weight="bold" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Google Calendar & Tasks</p>
                <p className="truncate text-xs text-muted-foreground">
                  {!status?.configured
                    ? "Not configured on this server"
                    : status.connected
                      ? (status.email ?? "Connected")
                      : "Sync your calendar and tasks"}
                </p>
              </div>
              {status?.connected && (
                <CheckCircleIcon
                  weight="fill"
                  className="size-5 shrink-0 text-primary"
                />
              )}
            </div>

            {!status?.configured ? (
              <p className="mt-3 rounded-md bg-muted px-2.5 py-2 text-xs leading-relaxed text-muted-foreground">
                Set <code className="font-mono">GOOGLE_CLIENT_ID</code> and{" "}
                <code className="font-mono">GOOGLE_CLIENT_SECRET</code> in your{" "}
                <code className="font-mono">.env</code> file, then restart. See
                the README for setup steps.
              </p>
            ) : status.connected ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {readOnly ? (
                  <p className="basis-full rounded-md bg-muted px-2.5 py-2 text-xs leading-relaxed text-muted-foreground">
                    Google sync is paused until cloud access is active.
                  </p>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={readOnly || importTasks.isPending}
                  onClick={() =>
                    importTasks.mutate(undefined, {
                      onSuccess: (r) =>
                        toast.success(
                          `Imported ${r.imported} task${r.imported === 1 ? "" : "s"} from Google`
                        ),
                      onError: () => toast.error("Could not import tasks"),
                    })
                  }
                >
                  <DownloadSimpleIcon />
                  Import Google Tasks
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={readOnly || disconnect.isPending}
                  onClick={() =>
                    disconnect.mutate(undefined, {
                      onSuccess: () => toast.success("Disconnected Google"),
                    })
                  }
                >
                  <LinkBreakIcon />
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="mt-3">
                <Button
                  size="sm"
                  disabled={readOnly || connect.isPending}
                  onClick={() => connect.mutate()}
                >
                  <GoogleLogoIcon weight="bold" />
                  Connect Google
                </Button>
              </div>
            )}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  )
}
