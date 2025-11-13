"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip } from "@/components/ui/tooltip"
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Search,
  Copy,
  Check,
  ChevronsDown,
  ChevronsUp,
  Filter,
} from "lucide-react"
import type { Violation } from "@/lib/scanner/types"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useTheme } from "next-themes"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

interface EnhancedViolationListProps {
  title: string
  violations: Violation[]
  icon: string
  description: string
}

type SortOption = "severity" | "elements" | "name"

export function EnhancedViolationList({
  title,
  violations,
  icon,
  description,
}: EnhancedViolationListProps) {
  const { theme } = useTheme()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("severity")
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {}
    violations.forEach((v) => {
      allExpanded[v.id] = true
    })
    setExpanded(allExpanded)
  }

  const collapseAll = () => {
    setExpanded({})
  }

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(id)
    toast.success("Code copied to clipboard")
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Filtered and sorted violations
  const processedViolations = useMemo(() => {
    let filtered = violations

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (v) =>
          v.help.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by severity
    if (filterSeverity) {
      filtered = filtered.filter((v) => v.severity === filterSeverity)
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "severity":
          const severityOrder = ["critical", "major", "moderate", "minor"]
          return severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
        case "elements":
          return b.nodes.length - a.nodes.length
        case "name":
          return a.help.localeCompare(b.help)
        default:
          return 0
      }
    })

    return sorted
  }, [violations, searchQuery, sortBy, filterSeverity])

  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    violations.forEach((v) => {
      counts[v.severity] = (counts[v.severity] || 0) + 1
    })
    return counts
  }, [violations])

  if (!violations || violations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{icon}</span>
            <span>{title}</span>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-2">
            <div className="text-5xl">✓</div>
            <p className="text-lg font-semibold text-green-600">No issues found!</p>
            <p className="text-sm text-muted-foreground">
              All tests in this category passed successfully.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>

        <div className="pt-4 space-y-4">
          {/* Severity Filter Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Filter:</span>
            <Button
              variant={filterSeverity === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterSeverity(null)}
            >
              All ({violations.length})
            </Button>
            {Object.entries(severityCounts).map(([severity, count]) => (
              <Button
                key={severity}
                variant={filterSeverity === severity ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterSeverity(severity)}
              >
                <Badge
                  variant={
                    severity === "critical"
                      ? "critical"
                      : severity === "major"
                      ? "major"
                      : severity === "moderate"
                      ? "moderate"
                      : "minor"
                  }
                  className="mr-2"
                >
                  {severity}
                </Badge>
                {count}
              </Button>
            ))}
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search violations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="severity">Sort by Severity</option>
                <option value="elements">Sort by Elements</option>
                <option value="name">Sort by Name</option>
              </select>

              <Tooltip content="Expand all">
                <Button variant="outline" size="sm" onClick={expandAll}>
                  <ChevronsDown className="h-4 w-4" />
                </Button>
              </Tooltip>

              <Tooltip content="Collapse all">
                <Button variant="outline" size="sm" onClick={collapseAll}>
                  <ChevronsUp className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>
          </div>

          {processedViolations.length < violations.length && (
            <p className="text-sm text-muted-foreground">
              Showing {processedViolations.length} of {violations.length} issues
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="popLayout">
          {processedViolations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <p className="text-muted-foreground">No violations match your filters</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {processedViolations.map((violation, index) => (
                <motion.div
                  key={`${violation.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  layout
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div
                    className="flex items-start justify-between cursor-pointer hover:bg-accent/50 p-2 rounded transition-colors"
                    onClick={() => toggleExpand(violation.id)}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={
                            violation.severity === "critical"
                              ? "critical"
                              : violation.severity === "major"
                              ? "major"
                              : violation.severity === "moderate"
                              ? "moderate"
                              : "minor"
                          }
                        >
                          {violation.severity}
                        </Badge>
                        <span className="font-semibold">{violation.help}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {violation.nodes.length} element
                        {violation.nodes.length !== 1 ? "s" : ""} affected
                      </p>
                    </div>
                    <button
                      className="p-1 hover:bg-accent rounded transition-colors"
                      aria-label={expanded[violation.id] ? "Collapse" : "Expand"}
                    >
                      {expanded[violation.id] ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {expanded[violation.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 pt-3 border-t"
                      >
                        <div>
                          <h4 className="font-semibold mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">
                            {violation.description}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">WCAG Criteria</h4>
                          <div className="flex flex-wrap gap-2">
                            {violation.wcagTags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Affected Elements</h4>
                          <div className="space-y-3">
                            {violation.nodes.slice(0, 5).map((node, nodeIndex) => (
                              <div
                                key={nodeIndex}
                                className="border rounded-lg overflow-hidden"
                              >
                                <div className="bg-muted px-3 py-2 flex items-center justify-between">
                                  <span className="text-xs font-mono text-muted-foreground">
                                    Element {nodeIndex + 1}
                                  </span>
                                  <Tooltip content="Copy code">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() =>
                                        copyCode(
                                          node.html,
                                          `${violation.id}-${nodeIndex}`
                                        )
                                      }
                                    >
                                      {copiedCode ===
                                      `${violation.id}-${nodeIndex}` ? (
                                        <Check className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </Tooltip>
                                </div>

                                <div className="relative">
                                  <SyntaxHighlighter
                                    language="html"
                                    style={theme === "dark" ? oneDark : oneLight}
                                    customStyle={{
                                      margin: 0,
                                      borderRadius: 0,
                                      fontSize: "0.75rem",
                                    }}
                                    showLineNumbers
                                  >
                                    {node.html}
                                  </SyntaxHighlighter>
                                </div>

                                {node.failureSummary && (
                                  <div className="px-3 py-2 bg-destructive/10 border-t">
                                    <p className="text-xs">
                                      <strong className="text-destructive">
                                        Issue:
                                      </strong>{" "}
                                      {node.failureSummary}
                                    </p>
                                  </div>
                                )}

                                {node.target && node.target.length > 0 && (
                                  <div className="px-3 py-2 bg-muted/50 border-t">
                                    <p className="text-xs font-mono text-muted-foreground">
                                      <strong>Selector:</strong>{" "}
                                      {node.target.join(" > ")}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}

                            {violation.nodes.length > 5 && (
                              <p className="text-xs text-muted-foreground text-center py-2">
                                ...and {violation.nodes.length - 5} more element(s)
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <a
                            href={violation.helpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            Learn more about fixing this issue
                            <ExternalLink className="h-3 w-3" />
                          </a>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toast("Remediation guide coming soon!", {
                                icon: "🔧",
                              })
                            }
                          >
                            View Fix Guide
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
