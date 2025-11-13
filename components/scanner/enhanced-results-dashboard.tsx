"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EnhancedViolationList } from "./enhanced-violation-list"
import { ViolationCharts } from "@/components/charts/violation-charts"
import { ExportMenu } from "@/components/export-menu"
import type { ScanResult } from "@/lib/scanner/types"
import { AlertCircle, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Share2 } from "lucide-react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import toast from "react-hot-toast"

interface EnhancedResultsDashboardProps {
  results: ScanResult
}

// Animated counter component
function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      setCount(Math.floor(progress * value))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return <span>{count}</span>
}

// Calculate accessibility score
function calculateScore(summary: ScanResult['summary']): number {
  const total = summary.violations + summary.passes
  if (total === 0) return 0
  return Math.round((summary.passes / total) * 100)
}

// Get grade based on score
function getGrade(score: number): { grade: string; color: string; bgColor: string } {
  if (score >= 95) return { grade: "A+", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" }
  if (score >= 90) return { grade: "A", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" }
  if (score >= 80) return { grade: "B", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" }
  if (score >= 70) return { grade: "C", color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" }
  if (score >= 60) return { grade: "D", color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30" }
  return { grade: "F", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30" }
}

export function EnhancedResultsDashboard({ results }: EnhancedResultsDashboardProps) {
  const { summary, violations, url, timestamp } = results
  const [previousScore, setPreviousScore] = useState<number | null>(null)

  const totalViolations = Object.values(violations).reduce((sum, arr) => sum + arr.length, 0)
  const score = calculateScore(summary)
  const gradeInfo = getGrade(score)

  // Trigger confetti for perfect scores
  useEffect(() => {
    if (totalViolations === 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }, [totalViolations])

  // Load previous score for comparison
  useEffect(() => {
    const key = `score_${url}`
    const saved = localStorage.getItem(key)
    if (saved) {
      setPreviousScore(parseInt(saved))
    }
    localStorage.setItem(key, score.toString())
  }, [url, score])

  const scoreDiff = previousScore !== null ? score - previousScore : null

  const handleShare = async () => {
    const shareText = `Accessibility Score: ${score}/100 (${gradeInfo.grade}) - ${totalViolations} violations found on ${url}`

    if (navigator.share) {
      try {
        await navigator.share({ title: "Accessibility Scan Results", text: shareText })
        toast.success("Shared successfully!")
      } catch (error) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      toast.success("Results copied to clipboard!")
    }
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.success("Export feature coming soon!")
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Summary Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Scan Results</CardTitle>
                <div className="text-sm text-muted-foreground space-y-1 mt-2">
                  <p><strong>URL:</strong> {url}</p>
                  <p><strong>Scanned:</strong> {new Date(timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Tooltip content="Share results">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </Tooltip>
                <ExportMenu results={results} />
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Score and Grade Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className={`${gradeInfo.bgColor} border-2`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Accessibility Score</h3>
                <div className="flex items-baseline gap-3">
                  <motion.div
                    className={`text-6xl font-bold ${gradeInfo.color}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                  >
                    <AnimatedCounter value={score} />
                  </motion.div>
                  <span className="text-3xl text-muted-foreground">/100</span>

                  {scoreDiff !== null && scoreDiff !== 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-1"
                    >
                      {scoreDiff > 0 ? (
                        <>
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <span className="text-lg text-green-600">+{scoreDiff}</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-5 w-5 text-red-600" />
                          <span className="text-lg text-red-600">{scoreDiff}</span>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>

                {scoreDiff !== null && scoreDiff !== 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {scoreDiff > 0 ? "Improved" : "Decreased"} since last scan
                  </p>
                )}
              </div>

              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
                className={`text-8xl font-bold ${gradeInfo.color}`}
              >
                {gradeInfo.grade}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-destructive">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Violations</CardTitle>
                <Tooltip content="Issues that must be fixed for compliance">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                <AnimatedCounter value={totalViolations} duration={1500} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Issues that must be fixed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Passes</CardTitle>
                <Tooltip content="Tests that passed successfully">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                <AnimatedCounter value={summary.passes} duration={1500} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tests passed successfully
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-yellow-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
                <Tooltip content="Items that require manual review">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">
                <AnimatedCounter value={summary.incomplete} duration={1500} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Items requiring manual review
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Perfect Score Message */}
      {totalViolations === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
        >
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-500">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-green-600">🎉 Perfect Score!</h3>
                <p className="text-muted-foreground">
                  Congratulations! Your website passed all accessibility tests.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Data Visualization */}
      {totalViolations > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4">Violation Analytics</h2>
          <ViolationCharts results={results} />
        </motion.div>
      )}

      {/* WCAG Principles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold">WCAG 2.2 Compliance Issues</h2>

        <EnhancedViolationList
          title="Perceivable Issues"
          violations={violations.perceivable}
          icon="👁️"
          description="Information and user interface components must be presentable to users in ways they can perceive"
        />

        <EnhancedViolationList
          title="Operable Issues"
          violations={violations.operable}
          icon="⌨️"
          description="User interface components and navigation must be operable"
        />

        <EnhancedViolationList
          title="Understandable Issues"
          violations={violations.understandable}
          icon="💡"
          description="Information and the operation of user interface must be understandable"
        />

        <EnhancedViolationList
          title="Robust Issues"
          violations={violations.robust}
          icon="🔧"
          description="Content must be robust enough to be interpreted by a wide variety of user agents"
        />

        {violations.other && violations.other.length > 0 && (
          <EnhancedViolationList
            title="Other Issues"
            violations={violations.other}
            icon="📋"
            description="Additional accessibility issues"
          />
        )}
      </motion.div>
    </div>
  )
}
