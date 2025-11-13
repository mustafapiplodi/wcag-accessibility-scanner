"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ScanResult, Violation } from "@/lib/scanner/types"
import { useTheme } from "next-themes"

interface ViolationChartsProps {
  results: ScanResult
}

const SEVERITY_COLORS = {
  critical: '#dc2626',
  major: '#ea580c',
  moderate: '#ca8a04',
  minor: '#2563eb',
}

const CATEGORY_COLORS = {
  perceivable: '#3b82f6',
  operable: '#8b5cf6',
  understandable: '#ec4899',
  robust: '#10b981',
  other: '#6b7280',
}

export function ViolationCharts({ results }: ViolationChartsProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Prepare data for severity distribution
  const severityData = Object.values(results.violations)
    .flat()
    .reduce((acc, violation) => {
      acc[violation.severity] = (acc[violation.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const severityChartData = Object.entries(severityData).map(([severity, count]) => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: count,
    color: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || '#6b7280'
  }))

  // Prepare data for category distribution
  const categoryChartData = Object.entries(results.violations).map(([category, violations]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    violations: violations.length,
    color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#6b7280'
  }))

  // Calculate total elements affected
  const elementsData = Object.entries(results.violations).map(([category, violations]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    elements: violations.reduce((sum: number, v: Violation) => sum + v.nodes.length, 0)
  }))

  const chartTheme = {
    text: isDark ? '#e5e7eb' : '#374151',
    grid: isDark ? '#374151' : '#e5e7eb',
    background: isDark ? '#1f2937' : '#ffffff',
  }

  const totalViolations = Object.values(results.violations).reduce((sum, arr) => sum + arr.length, 0)

  if (totalViolations === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Violation Analytics</CardTitle>
          <CardDescription>No violations to display</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-6xl mb-4">🎉</div>
            <p>Perfect score! No violations found.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Severity Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Violations by Severity</CardTitle>
          <CardDescription>Distribution of issues by severity level</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {severityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: chartTheme.background,
                  border: `1px solid ${chartTheme.grid}`,
                  borderRadius: '6px',
                  color: chartTheme.text
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {severityChartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm">{String(item.name)}: {String(item.value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Violations by WCAG Principle</CardTitle>
          <CardDescription>Issues grouped by accessibility principle</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis
                dataKey="name"
                tick={{ fill: chartTheme.text, fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: chartTheme.text }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartTheme.background,
                  border: `1px solid ${chartTheme.grid}`,
                  borderRadius: '6px',
                  color: chartTheme.text
                }}
              />
              <Bar dataKey="violations" radius={[8, 8, 0, 0]}>
                {categoryChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Elements Affected Bar Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Elements Affected by Category</CardTitle>
          <CardDescription>Total number of HTML elements with issues</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={elementsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis type="number" tick={{ fill: chartTheme.text }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: chartTheme.text, fontSize: 12 }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartTheme.background,
                  border: `1px solid ${chartTheme.grid}`,
                  borderRadius: '6px',
                  color: chartTheme.text
                }}
              />
              <Bar dataKey="elements" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
