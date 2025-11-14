"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScanComparison } from "./scan-comparison"
import { HistoricalTrends } from "./historical-trends"
import type { ScanResult } from "@/lib/scanner/types"
import { GitCompare, TrendingUp, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ComparisonSelectorProps {
  currentScan?: ScanResult
  onBack?: () => void
}

export function ComparisonSelector({ currentScan, onBack }: ComparisonSelectorProps) {
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([])
  const [selectedBaseline, setSelectedBaseline] = useState<ScanResult | null>(null)
  const [selectedCurrent, setSelectedCurrent] = useState<ScanResult | null>(currentScan || null)
  const [comparisonMode, setComparisonMode] = useState<'compare' | 'trends'>('compare')

  useEffect(() => {
    // Load scan history from localStorage
    const loadHistory = () => {
      try {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('scan_score_'))
        const scans: ScanResult[] = []

        keys.forEach(key => {
          const data = localStorage.getItem(key)
          if (data) {
            try {
              const scanData = JSON.parse(data)
              if (scanData.result) {
                scans.push(scanData.result)
              }
            } catch (e) {
              // Skip invalid entries
            }
          }
        })

        // Sort by timestamp, newest first
        scans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setScanHistory(scans)
      } catch (error) {
        console.error('Error loading scan history:', error)
      }
    }

    loadHistory()
  }, [])

  const handleCompare = () => {
    if (selectedBaseline && selectedCurrent) {
      setComparisonMode('compare')
    }
  }

  if (scanHistory.length < 2 && !currentScan) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <GitCompare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Not Enough Scan History</h3>
            <p className="text-muted-foreground">
              You need at least 2 scans in your history to use comparison features.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Scan history: {scanHistory.length} scan{scanHistory.length !== 1 ? 's' : ''}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If we have baseline and current selected, show comparison
  if (selectedBaseline && selectedCurrent) {
    return (
      <ScanComparison
        baseline={selectedBaseline}
        current={selectedCurrent}
        onBack={() => {
          setSelectedBaseline(null)
          setSelectedCurrent(currentScan || null)
        }}
      />
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Comparison & Trends
          </CardTitle>
          <CardDescription>
            Compare scans and track accessibility improvements over time
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={comparisonMode} onValueChange={(v) => setComparisonMode(v as 'compare' | 'trends')}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="compare">
            <GitCompare className="h-4 w-4 mr-2" />
            Compare Scans
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compare" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Scans to Compare</CardTitle>
              <CardDescription>
                Choose a baseline scan and a current scan to see what changed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Baseline Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Baseline Scan</label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {scanHistory.map((scan, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedBaseline(scan)}
                      className={`p-3 border rounded-lg text-left transition-all ${
                        selectedBaseline?.timestamp === scan.timestamp
                          ? 'border-primary bg-primary/10'
                          : 'hover:border-primary/50 hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{scan.url}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(scan.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="destructive" className="text-xs">
                            {scan.summary.violations} issues
                          </Badge>
                          <Badge variant="default" className="bg-green-500 text-xs">
                            {scan.summary.passes} passed
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Current Scan</label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {scanHistory.map((scan, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCurrent(scan)}
                      className={`p-3 border rounded-lg text-left transition-all ${
                        selectedCurrent?.timestamp === scan.timestamp
                          ? 'border-primary bg-primary/10'
                          : 'hover:border-primary/50 hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{scan.url}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(scan.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="destructive" className="text-xs">
                            {scan.summary.violations} issues
                          </Badge>
                          <Badge variant="default" className="bg-green-500 text-xs">
                            {scan.summary.passes} passed
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCompare}
                disabled={!selectedBaseline || !selectedCurrent || selectedBaseline.timestamp === selectedCurrent.timestamp}
                className="w-full"
                size="lg"
              >
                <GitCompare className="h-4 w-4 mr-2" />
                Compare Selected Scans
              </Button>

              {selectedBaseline?.timestamp === selectedCurrent?.timestamp && (
                <p className="text-sm text-destructive text-center">
                  Please select two different scans to compare
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          {scanHistory.length >= 2 ? (
            <HistoricalTrends scans={scanHistory} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Not Enough Data</h3>
                  <p className="text-muted-foreground">
                    You need at least 2 scans to view historical trends.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Current scans: {scanHistory.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
