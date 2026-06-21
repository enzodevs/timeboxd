import { cn } from "@/lib/utils"
import { BlurFade } from "@/components/magicui/blur-fade"

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
}: SectionHeadingProps) {
  return (
    <BlurFade inView>
      <div className={cn("mx-auto max-w-2xl text-center", className)}>
        {eyebrow ? (
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-4 text-lg text-pretty text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
    </BlurFade>
  )
}
