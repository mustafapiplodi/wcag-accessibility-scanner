"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

const SCAN_STAGES = [
  { label: "Initializing browser...", duration: 2000 },
  { label: "Loading page...", duration: 3000 },
  { label: "Analyzing accessibility...", duration: 4000 },
  { label: "Generating report...", duration: 2000 },
]

export function ScanProgress() {
  const [currentStage, setCurrentStage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const totalDuration = SCAN_STAGES.reduce((sum, stage) => sum + stage.duration, 0)
    let elapsed = 0

    const interval = setInterval(() => {
      elapsed += 100

      // Calculate progress
      const newProgress = Math.min((elapsed / totalDuration) * 100, 95)
      setProgress(newProgress)

      // Update stage
      let cumulativeDuration = 0
      for (let i = 0; i < SCAN_STAGES.length; i++) {
        cumulativeDuration += SCAN_STAGES[i].duration
        if (elapsed < cumulativeDuration) {
          setCurrentStage(i)
          break
        }
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStage}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-lg font-medium"
              >
                {SCAN_STAGES[currentStage]?.label}
              </motion.p>
            </AnimatePresence>
          </div>

          <Progress value={progress} className="h-2" />

          <p className="text-center text-sm text-muted-foreground">
            {Math.round(progress)}% complete
          </p>

          <div className="flex justify-center gap-2 mt-4">
            {SCAN_STAGES.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index <= currentStage
                    ? "bg-primary scale-110"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
