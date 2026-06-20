import * as React from "react"

export function NowIndicator({ pxPerHour }: { pxPerHour: number }) {
  const [minutes, setMinutes] = React.useState(() => {
    const d = new Date()
    return d.getHours() * 60 + d.getMinutes()
  })

  React.useEffect(() => {
    const tick = () => {
      const d = new Date()
      setMinutes(d.getHours() * 60 + d.getMinutes())
    }
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-20"
      style={{ top: (minutes / 60) * pxPerHour }}
    >
      <div className="relative h-px w-full bg-primary">
        <div className="absolute top-1/2 -left-1 size-2.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_0_3px_var(--background)]" />
      </div>
    </div>
  )
}
