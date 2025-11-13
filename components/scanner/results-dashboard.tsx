"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ViolationList } from "./violation-list"
import type { ScanResult } from "@/lib/scanner/types"
import { AlertCircle, CheckCircle, AlertTriangle, Eye, Keyboard, Lightbulb, Wrench } from "lucide-react"

interface ResultsDashboardProps {
  results: ScanResult
}

export function ResultsDashboard({ results }: ResultsDashboardProps) {
  const { summary, violations, url, timestamp } = results

  const totalViolations = Object.values(violations).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <CardTitle>Scan Results</CardTitle>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>URL:</strong> {url}</p>
            <p><strong>Scanned:</strong> {new Date(timestamp).toLocaleString()}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Violations</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{totalViolations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Issues that must be fixed
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Passes</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{summary.passes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tests passed successfully
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{summary.incomplete}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Items requiring manual review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* WCAG Principles */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">WCAG 2.2 Compliance Issues</h2>

        <ViolationList
          title="Perceivable Issues"
          violations={violations.perceivable}
          icon="👁️"
          description="Information and user interface components must be presentable to users in ways they can perceive"
        />

        <ViolationList
          title="Operable Issues"
          violations={violations.operable}
          icon="⌨️"
          description="User interface components and navigation must be operable"
        />

        <ViolationList
          title="Understandable Issues"
          violations={violations.understandable}
          icon="💡"
          description="Information and the operation of user interface must be understandable"
        />

        <ViolationList
          title="Robust Issues"
          violations={violations.robust}
          icon="🔧"
          description="Content must be robust enough to be interpreted by a wide variety of user agents"
        />

        {violations.other && violations.other.length > 0 && (
          <ViolationList
            title="Other Issues"
            violations={violations.other}
            icon="📋"
            description="Additional accessibility issues"
          />
        )}
      </div>
    </div>
  )
}
