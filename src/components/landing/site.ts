// Central swap-points for the landing page. Edit these in one place.
export const SITE = {
  /** Brand wordmark. Repo/product name is "timeboxd"; change to "Timebox" if preferred. */
  brand: "timeboxd",
  /** Where the "Launch app" buttons send people (the actual app shell). */
  appPath: "/app",
  /** Public repo. README references this placeholder — update to your real URL. */
  githubUrl: "https://github.com/your-username/timeboxd",
  tagline: "Time-boxing for your day.",
} as const

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const
