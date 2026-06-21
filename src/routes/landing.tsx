import { createFileRoute } from "@tanstack/react-router"

import { LandingPage } from "@/components/landing/LandingPage"

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "timeboxd — time-boxing for your day" },
      {
        name: "description",
        content:
          "Open-source, local-first time-boxing. Plan your to-dos, drag them onto a timeline as time-boxes, and braindump notes — all in one keyboard-friendly workspace.",
      },
    ],
  }),
  component: LandingPage,
})
