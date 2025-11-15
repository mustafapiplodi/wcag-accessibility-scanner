"use client"

import { HelpCircle } from "lucide-react"
import { Tooltip } from "./tooltip"

interface InfoTooltipProps {
  content: string
  side?: "top" | "right" | "bottom" | "left"
}

export function InfoTooltip({ content, side = "top" }: InfoTooltipProps) {
  return (
    <Tooltip content={content} side={side}>
      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help inline-block" />
    </Tooltip>
  )
}
