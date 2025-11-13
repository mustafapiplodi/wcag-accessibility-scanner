"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react"
import type { Violation } from "@/lib/scanner/types"

interface ViolationListProps {
  title: string
  violations: Violation[]
  icon: string
  description: string
}

export function ViolationList({ title, violations, icon, description }: ViolationListProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

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
          <p className="text-sm text-muted-foreground">No issues found ✓</p>
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
        <div className="pt-2">
          <Badge variant="destructive">{violations.length} issues found</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {violations.map((violation, index) => (
            <div
              key={`${violation.id}-${index}`}
              className="border rounded-lg p-4 space-y-3"
            >
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => toggleExpand(violation.id)}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        violation.severity === 'critical' ? 'critical' :
                        violation.severity === 'major' ? 'major' :
                        violation.severity === 'moderate' ? 'moderate' : 'minor'
                      }
                    >
                      {violation.severity}
                    </Badge>
                    <span className="font-semibold">{violation.help}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {violation.nodes.length} element{violation.nodes.length !== 1 ? 's' : ''} affected
                  </p>
                </div>
                <button
                  className="p-1 hover:bg-accent rounded"
                  aria-label={expanded[violation.id] ? "Collapse" : "Expand"}
                >
                  {expanded[violation.id] ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
              </div>

              {expanded[violation.id] && (
                <div className="space-y-4 pt-3 border-t">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{violation.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">WCAG Criteria</h4>
                    <div className="flex flex-wrap gap-2">
                      {violation.wcagTags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Affected Elements</h4>
                    <div className="space-y-2">
                      {violation.nodes.slice(0, 5).map((node, nodeIndex) => (
                        <div key={nodeIndex} className="bg-muted p-3 rounded text-xs space-y-2">
                          <div>
                            <strong>HTML:</strong>
                            <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all">
                              <code>{node.html}</code>
                            </pre>
                          </div>
                          {node.failureSummary && (
                            <div>
                              <strong>Issue:</strong>
                              <p className="mt-1">{node.failureSummary}</p>
                            </div>
                          )}
                        </div>
                      ))}
                      {violation.nodes.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          ...and {violation.nodes.length - 5} more element(s)
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <a
                      href={violation.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Learn more about fixing this issue
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
