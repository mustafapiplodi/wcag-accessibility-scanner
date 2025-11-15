"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ScanResult, Violation } from "@/lib/scanner/types"
import { isQuickWin, getViolationPriority, getEstimatedFixTime } from "@/lib/violation-priority"
import { Zap, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

interface QuickWinsProps {
  results: ScanResult
}

export function QuickWins({ results }: QuickWinsProps) {
  // Get all violations and filter for quick wins
  const allViolations: Violation[] = Object.values(results.violations).flat()
  const quickWins = allViolations.filter(isQuickWin).slice(0, 5) // Top 5 quick wins

  if (quickWins.length === 0) {
    return null
  }

  const totalEstimatedTime = quickWins.reduce((total, violation) => {
    const timeStr = getEstimatedFixTime(violation)
    // Extract minutes from time string (rough estimation)
    const match = timeStr.match(/(\d+)-(\d+)/)
    if (match) {
      const avg = (parseInt(match[1]) + parseInt(match[2])) / 2
      return total + avg
    }
    return total
  }, 0)

  return (
    <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <Zap className="h-5 w-5" />
          Quick Wins
        </CardTitle>
        <CardDescription>
          {quickWins.length} high-impact issues that are easy to fix
          {totalEstimatedTime > 0 && ` • Est. total time: ~${Math.round(totalEstimatedTime)} min`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quickWins.map((violation, index) => {
            const priority = getViolationPriority(violation)

            return (
              <motion.div
                key={violation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-background rounded-lg border border-green-200 dark:border-green-800/50 hover:border-green-300 dark:hover:border-green-700 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold">
                  {index + 1}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{violation.help}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${priority.bgColor} ${priority.color} border text-xs`}>
                          {priority.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {violation.nodes.length} element{violation.nodes.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          ⏱ {getEstimatedFixTime(violation)}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 h-8 w-8 p-0"
                      onClick={() => window.open(violation.helpUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Learn more</span>
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {violation.description}
                  </p>
                </div>
              </motion.div>
            )
          })}

          {allViolations.filter(isQuickWin).length > 5 && (
            <p className="text-xs text-center text-muted-foreground pt-2">
              + {allViolations.filter(isQuickWin).length - 5} more quick wins in the full list below
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
