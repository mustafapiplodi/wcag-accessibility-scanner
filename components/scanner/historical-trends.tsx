"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ScanResult } from "@/lib/scanner/types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"
import { TrendingDown, TrendingUp, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface HistoricalTrendsProps {
  scans: ScanResult[]
}

export function HistoricalTrends({ scans }: HistoricalTrendsProps) {
  const { theme } = useTheme()

  // Sort scans by timestamp
  const sortedScans = [...scans].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  // Prepare chart data
  const chartData = sortedScans.map((scan, index) => ({
    name: `Scan ${index + 1}`,
    date: new Date(scan.timestamp).toLocaleDateString(),
    violations: scan.summary.violations,
    passes: scan.summary.passes,
    incomplete: scan.summary.incomplete,
    score: scan.summary.passes + scan.summary.violations > 0
      ? Math.round((scan.summary.passes / (scan.summary.passes + scan.summary.violations)) * 100)
      : 0
  }))

  // Calculate trends
  const latestScan = sortedScans[sortedScans.length - 1]
  const oldestScan = sortedScans[0]

  const violationsTrend = latestScan.summary.violations - oldestScan.summary.violations
  const passesTrend = latestScan.summary.passes - oldestScan.summary.passes
  const scoreTrend = chartData[chartData.length - 1].score - chartData[0].score

  const chartColors = {
    violations: theme === 'dark' ? '#ef4444' : '#dc2626',
    passes: theme === 'dark' ? '#22c55e' : '#16a34a',
    incomplete: theme === 'dark' ? '#eab308' : '#ca8a04',
    score: theme === 'dark' ? '#3b82f6' : '#2563eb'
  }

  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb'
  const textColor = theme === 'dark' ? '#9ca3af' : '#6b7280'

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Historical Trends
          </CardTitle>
          <CardDescription>
            Tracking accessibility improvements over {sortedScans.length} scans
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Violations Trend</p>
                <p className="text-2xl font-bold">{violationsTrend > 0 ? '+' : ''}{violationsTrend}</p>
              </div>
              <div className="flex items-center gap-2">
                {violationsTrend < 0 ? (
                  <>
                    <TrendingDown className="h-6 w-6 text-green-500" />
                    <Badge variant="default" className="bg-green-500">Improving</Badge>
                  </>
                ) : violationsTrend > 0 ? (
                  <>
                    <TrendingUp className="h-6 w-6 text-destructive" />
                    <Badge variant="destructive">Declining</Badge>
                  </>
                ) : (
                  <Badge variant="secondary">Stable</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Passes Trend</p>
                <p className="text-2xl font-bold">{passesTrend > 0 ? '+' : ''}{passesTrend}</p>
              </div>
              <div className="flex items-center gap-2">
                {passesTrend > 0 ? (
                  <>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                    <Badge variant="default" className="bg-green-500">Improving</Badge>
                  </>
                ) : passesTrend < 0 ? (
                  <>
                    <TrendingDown className="h-6 w-6 text-destructive" />
                    <Badge variant="destructive">Declining</Badge>
                  </>
                ) : (
                  <Badge variant="secondary">Stable</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score Trend</p>
                <p className="text-2xl font-bold">{scoreTrend > 0 ? '+' : ''}{scoreTrend}%</p>
              </div>
              <div className="flex items-center gap-2">
                {scoreTrend > 0 ? (
                  <>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                    <Badge variant="default" className="bg-green-500">Improving</Badge>
                  </>
                ) : scoreTrend < 0 ? (
                  <>
                    <TrendingDown className="h-6 w-6 text-destructive" />
                    <Badge variant="destructive">Declining</Badge>
                  </>
                ) : (
                  <Badge variant="secondary">Stable</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Violations & Passes Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Violations & Passes Over Time</CardTitle>
          <CardDescription>
            Track how violations and passed tests change across scans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                stroke={textColor}
                tick={{ fill: textColor }}
              />
              <YAxis
                stroke={textColor}
                tick={{ fill: textColor }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: `1px solid ${gridColor}`,
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="violations"
                stroke={chartColors.violations}
                strokeWidth={2}
                dot={{ fill: chartColors.violations, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="passes"
                stroke={chartColors.passes}
                strokeWidth={2}
                dot={{ fill: chartColors.passes, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Score Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Score Trend</CardTitle>
          <CardDescription>
            Your overall accessibility score progression
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                stroke={textColor}
                tick={{ fill: textColor }}
              />
              <YAxis
                stroke={textColor}
                tick={{ fill: textColor }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: `1px solid ${gridColor}`,
                  borderRadius: '6px'
                }}
                formatter={(value) => [`${value}%`, 'Score']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={chartColors.score}
                strokeWidth={3}
                dot={{ fill: chartColors.score, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scan Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scan History Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">#</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-right py-3 px-4 font-medium">Violations</th>
                  <th className="text-right py-3 px-4 font-medium">Passes</th>
                  <th className="text-right py-3 px-4 font-medium">Incomplete</th>
                  <th className="text-right py-3 px-4 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((scan, index) => (
                  <tr key={index} className="border-b hover:bg-accent/50">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{scan.date}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-destructive font-medium">{scan.violations}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-green-500 font-medium">{scan.passes}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-yellow-500 font-medium">{scan.incomplete}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant={scan.score >= 90 ? 'default' : scan.score >= 70 ? 'secondary' : 'destructive'}>
                        {scan.score}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
