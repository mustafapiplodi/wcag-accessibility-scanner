import { Shield } from "lucide-react"

interface LogoProps {
  className?: string
  iconClassName?: string
}

export function Logo({ className = "", iconClassName = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Shield className={`h-8 w-8 text-primary ${iconClassName}`} />
        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold leading-none">WCAG Scanner</span>
        <span className="text-xs text-muted-foreground leading-none">Accessibility Testing</span>
      </div>
    </div>
  )
}
