"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ScanResult } from "@/lib/scanner/types"
import { TrendingDown, TrendingUp, Minus, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

interface ScanComparisonProps {
  baseline: ScanResult
  current: ScanResult
  onBack?: () => void
}

export function ScanComparison({ baseline, current, onBack }: ScanComparisonProps) {
  const comparison = useMemo(() => {
    const violationsDiff = current.summary.violations - baseline.summary.violations
    const passesDiff = current.summary.passes - baseline.summary.passes
    const incompleteDiff = current.summary.incomplete - baseline.summary.incomplete

    const violationsPercentChange = baseline.summary.violations > 0
      ? ((violationsDiff / baseline.summary.violations) * 100).toFixed(1)
      : '0'

    const passesPercentChange = baseline.summary.passes > 0
      ? ((passesDiff / baseline.summary.passes) * 100).toFixed(1)
      : '0'

    // Find new violations
    const baselineViolationIds = new Set(
      Object.values(baseline.violations).flat().map(v => v.id)
    )
    const currentViolationIds = new Set(
      Object.values(current.violations).flat().map(v => v.id)
    )

    const newViolations = Array.from(currentViolationIds).filter(
      id => !baselineViolationIds.has(id)
    )
    const fixedViolations = Array.from(baselineViolationIds).filter(
      id => !currentViolationIds.has(id)
    )

    return {
      violationsDiff,
      passesDiff,
      incompleteDiff,
      violationsPercentChange,
      passesPercentChange,
      newViolations,
      fixedViolations
    }
  }, [baseline, current])

  const getTrendIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-destructive" />
    if (diff < 0) return <TrendingDown className="h-4 w-4 text-green-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getDiffColor = (diff: number, inverse = false) => {
    if (inverse) {
      // For passes, positive is good
      if (diff > 0) return "text-green-500"
      if (diff < 0) return "text-destructive"
    } else {
      // For violations, negative is good
      if (diff > 0) return "text-destructive"
      if (diff < 0) return "text-green-500"
    }
    return "text-muted-foreground"
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Scan Comparison</CardTitle>
              <CardDescription>
                Comparing results from {new Date(baseline.timestamp).toLocaleDateString()} to {new Date(current.timestamp).toLocaleDateString()}
              </CardDescription>
            </div>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Summary Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Violations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Violations</span>
                {getTrendIcon(comparison.violationsDiff)}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{current.summary.violations}</span>
                <span className={`text-sm font-medium ${getDiffColor(comparison.violationsDiff)}`}>
                  {comparison.violationsDiff > 0 ? '+' : ''}{comparison.violationsDiff}
                  <span className="text-xs ml-1">
                    ({comparison.violationsPercentChange > '0' ? '+' : ''}{comparison.violationsPercentChange}%)
                  </span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {baseline.summary.violations}
              </p>
            </motion.div>

            {/* Passes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Passed Tests</span>
                {getTrendIcon(-comparison.passesDiff)} {/* Inverse for passes */}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{current.summary.passes}</span>
                <span className={`text-sm font-medium ${getDiffColor(comparison.passesDiff, true)}`}>
                  {comparison.passesDiff > 0 ? '+' : ''}{comparison.passesDiff}
                  <span className="text-xs ml-1">
                    ({comparison.passesPercentChange > '0' ? '+' : ''}{comparison.passesPercentChange}%)
                  </span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {baseline.summary.passes}
              </p>
            </motion.div>

            {/* Incomplete */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Needs Review</span>
                {getTrendIcon(comparison.incompleteDiff)}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{current.summary.incomplete}</span>
                <span className={`text-sm font-medium ${getDiffColor(comparison.incompleteDiff)}`}>
                  {comparison.incompleteDiff > 0 ? '+' : ''}{comparison.incompleteDiff}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {baseline.summary.incomplete}
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* New & Fixed Violations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fixed Violations */}
        {comparison.fixedViolations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-500">
                  {comparison.fixedViolations.length}
                </Badge>
                Fixed Issues
              </CardTitle>
              <CardDescription>
                Violations that were present in baseline but fixed in current scan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {comparison.fixedViolations.map((id, index) => {
                  const violation = Object.values(baseline.violations)
                    .flat()
                    .find(v => v.id === id)
                  return (
                    <li key={index} className="text-sm border-l-4 border-green-500 pl-3 py-1">
                      {violation?.help || id}
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* New Violations */}
        {comparison.newViolations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="destructive">
                  {comparison.newViolations.length}
                </Badge>
                New Issues
              </CardTitle>
              <CardDescription>
                New violations found in current scan that weren't in baseline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {comparison.newViolations.map((id, index) => {
                  const violation = Object.values(current.violations)
                    .flat()
                    .find(v => v.id === id)
                  return (
                    <li key={index} className="text-sm border-l-4 border-destructive pl-3 py-1">
                      {violation?.help || id}
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* No Changes Message */}
      {comparison.fixedViolations.length === 0 && comparison.newViolations.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Minus className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-semibold mb-1">No Changes Detected</h3>
              <p className="text-sm text-muted-foreground">
                The same violations were found in both scans
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
