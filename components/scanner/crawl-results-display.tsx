"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CrawlResult } from "@/lib/scanner/crawler"
import { motion } from "framer-motion"
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react"
import { useState } from "react"

interface CrawlResultsDisplayProps {
  results: CrawlResult
}

export function CrawlResultsDisplay({ results }: CrawlResultsDisplayProps) {
  const [expandedPages, setExpandedPages] = useState<Set<number>>(new Set())

  const togglePage = (index: number) => {
    const newExpanded = new Set(expandedPages)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedPages(newExpanded)
  }

  const duration = Math.round(results.duration / 1000)

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Page Scan Complete</CardTitle>
          <CardDescription>
            Scanned {results.scannedPages} pages in {duration} seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{results.totalPages}</div>
              <div className="text-sm text-muted-foreground">Pages Crawled</div>
            </div>
            <div className="text-center p-4 border rounded-lg border-destructive">
              <div className="text-2xl font-bold text-destructive">{results.totalViolations}</div>
              <div className="text-sm text-muted-foreground">Total Violations</div>
            </div>
            <div className="text-center p-4 border rounded-lg border-green-500">
              <div className="text-2xl font-bold text-green-500">{results.totalPasses}</div>
              <div className="text-sm text-muted-foreground">Tests Passed</div>
            </div>
            <div className="text-center p-4 border rounded-lg border-yellow-500">
              <div className="text-2xl font-bold text-yellow-500">{results.totalIncomplete}</div>
              <div className="text-sm text-muted-foreground">Needs Review</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Violations */}
      <Card>
        <CardHeader>
          <CardTitle>Most Common Violations</CardTitle>
          <CardDescription>
            Issues found across multiple pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.commonViolations.map((violation, index) => (
              <div key={violation.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        violation.severity === 'critical' ? 'critical' :
                        violation.severity === 'major' ? 'major' :
                        violation.severity === 'moderate' ? 'moderate' : 'minor'
                      }>
                        {violation.severity}
                      </Badge>
                      <span className="font-semibold">{violation.help}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Found on {violation.count} page{violation.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge variant="outline">{index + 1}</Badge>
                </div>
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer text-primary">
                    View affected pages
                  </summary>
                  <ul className="mt-2 space-y-1 ml-4">
                    {violation.urls.slice(0, 5).map((url, i) => (
                      <li key={i} className="text-xs text-muted-foreground truncate">
                        • {url}
                      </li>
                    ))}
                    {violation.urls.length > 5 && (
                      <li className="text-xs text-muted-foreground">
                        ...and {violation.urls.length - 5} more
                      </li>
                    )}
                  </ul>
                </details>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Scanned Pages</CardTitle>
          <CardDescription>
            Detailed results for each page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {results.pages.map((page, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border rounded-lg"
              >
                <button
                  onClick={() => togglePage(index)}
                  className="w-full p-4 flex items-center justify-between hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    {expandedPages.has(index) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm truncate">{page.url}</p>
                      <p className="text-xs text-muted-foreground">
                        {page.summary.violations} violations • {page.summary.passes} passed
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {page.summary.violations > 0 && (
                      <Badge variant="destructive">{page.summary.violations}</Badge>
                    )}
                    {page.summary.violations === 0 && (
                      <Badge variant="default" className="bg-green-500">✓</Badge>
                    )}
                  </div>
                </button>

                {expandedPages.has(index) && (
                  <div className="p-4 border-t space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Violations:</span>{' '}
                        <span className="font-medium">{page.summary.violations}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Passed:</span>{' '}
                        <span className="font-medium">{page.summary.passes}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Incomplete:</span>{' '}
                        <span className="font-medium">{page.summary.incomplete}</span>
                      </div>
                      <div>
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          View Page
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    {Object.entries(page.violations).map(([category, violations]) => {
                      if (violations.length === 0) return null
                      return (
                        <div key={category} className="mt-3">
                          <p className="text-sm font-medium capitalize">
                            {category}: {violations.length} issues
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
