"use client"

import { useState, lazy, Suspense } from "react"
import { EnhancedScanForm } from "@/components/scanner/enhanced-scan-form"
import { ScanProgress } from "@/components/scanner/scan-progress"
import { MultiPageScanForm } from "@/components/scanner/multi-page-scan-form"
import { CrawlProgressDisplay } from "@/components/scanner/crawl-progress-display"
import { Header } from "@/components/header"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LoadingCard } from "@/components/ui/loading"
import type { ScanResult, CrawlResult, CrawlProgress } from "@/lib/scanner/types"
import { demoScanResult } from "@/lib/demo-data"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import { GitCompare, Eye } from "lucide-react"

// Lazy load heavy components for better performance
const EnhancedResultsDashboard = lazy(() => import("@/components/scanner/enhanced-results-dashboard").then(mod => ({ default: mod.EnhancedResultsDashboard })))
const CrawlResultsDisplay = lazy(() => import("@/components/scanner/crawl-results-display").then(mod => ({ default: mod.CrawlResultsDisplay })))
const ComparisonSelector = lazy(() => import("@/components/scanner/comparison-selector").then(mod => ({ default: mod.ComparisonSelector })))

export default function Home() {
  const [viewMode, setViewMode] = useState<'scan' | 'compare'>('scan')
  const [scanMode, setScanMode] = useState<'single' | 'multi'>('single')
  const [isScanning, setIsScanning] = useState(false)
  const [results, setResults] = useState<ScanResult | null>(null)
  const [crawlResults, setCrawlResults] = useState<CrawlResult | null>(null)
  const [crawlProgress, setCrawlProgress] = useState<CrawlProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  const handleScan = async (url: string, options: { wcagLevel: string }) => {
    setIsScanning(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, options }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Scan failed')
      }

      setResults(data)
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while scanning'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Scan error:', err)
    } finally {
      setIsScanning(false)
    }
  }

  const handleCrawl = async (url: string, options: any) => {
    setIsScanning(true)
    setError(null)
    setCrawlResults(null)
    setCrawlProgress({
      current: 0,
      total: 0,
      status: 'crawling',
      currentUrl: url
    })

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, options }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Crawl failed')
      }

      setCrawlResults(data)
      toast.success(`Successfully scanned ${data.totalPages} pages!`)
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while crawling'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Crawl error:', err)
    } finally {
      setIsScanning(false)
      setCrawlProgress(null)
    }
  }

  const handleNewScan = () => {
    setViewMode('scan')
    setResults(null)
    setCrawlResults(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewDemo = () => {
    setResults(demoScanResult)
    setViewMode('scan')
    toast.success('Viewing demo report')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onNewScan={handleNewScan}
        onCompare={() => setViewMode('compare')}
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
      />

      {/* Header */}
      <Header
        showNewScanButton={!!(results || crawlResults)}
        showCompareButton={!!(results || crawlResults)}
        onNewScan={handleNewScan}
        onCompare={() => setViewMode('compare')}
        onShowKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
      />

      {/* Main Content */}
      <div id="main-content" className="container mx-auto px-4 py-8 space-y-8">
        {/* Comparison View */}
        {viewMode === 'compare' && !isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Suspense fallback={<LoadingCard />}>
              <ComparisonSelector
                currentScan={results || undefined}
                onBack={() => setViewMode('scan')}
              />
            </Suspense>
          </motion.div>
        )}

        {/* Scan View */}
        {viewMode === 'scan' && (
          <>
            {/* Hero Section */}
            <AnimatePresence mode="wait">
              {!results && !crawlResults && !isScanning && (
                <motion.div
                  key="hero"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center space-y-4 max-w-3xl mx-auto mb-12"
                >
                  <h2 className="text-4xl font-bold tracking-tight">
                    Free WCAG 2.2 Accessibility Scanner
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Automatically scan your website for WCAG compliance issues and get actionable
                    remediation guidance to prevent ADA lawsuits and improve web accessibility.
                  </p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Button
                      onClick={handleViewDemo}
                      variant="outline"
                      size="lg"
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Demo Report
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      See what a scan report looks like before testing your own site
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

        {/* Scan Form with Tabs */}
        {!results && !crawlResults && !isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs value={scanMode} onValueChange={(value) => setScanMode(value as 'single' | 'multi')} className="w-full max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="single">Single Page Scan</TabsTrigger>
                <TabsTrigger value="multi">Multi-Page Scan</TabsTrigger>
              </TabsList>

              <TabsContent value="single">
                <EnhancedScanForm onScan={handleScan} isScanning={isScanning} />
              </TabsContent>

              <TabsContent value="multi">
                <MultiPageScanForm onScan={handleCrawl} isScanning={isScanning} />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        {/* Progress Indicator */}
        {isScanning && scanMode === 'single' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ScanProgress />
          </motion.div>
        )}

        {/* Crawl Progress */}
        {isScanning && scanMode === 'multi' && crawlProgress && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CrawlProgressDisplay progress={crawlProgress} />
          </motion.div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && !isScanning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto p-4 bg-destructive/10 border border-destructive rounded-lg"
            >
              <div className="flex items-center gap-2">
                <p className="text-destructive font-medium">Error: {error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Single Page Results */}
        {results && !isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Suspense fallback={<LoadingCard />}>
              <EnhancedResultsDashboard results={results} onCompare={() => setViewMode('compare')} />
            </Suspense>
          </motion.div>
        )}

        {/* Multi-Page Results */}
        {crawlResults && !isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Suspense fallback={<LoadingCard />}>
              <CrawlResultsDisplay results={crawlResults} />
            </Suspense>
          </motion.div>
        )}

            {/* Features Section */}
            {!results && !crawlResults && !isScanning && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="max-w-6xl mx-auto pt-12"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-xl font-semibold mb-2">WCAG 2.2 Support</h3>
                      <p className="text-muted-foreground">
                        Test against the latest WCAG 2.2 guidelines including new success criteria
                        for enhanced accessibility.
                      </p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-xl font-semibold mb-2">Actionable Results</h3>
                      <p className="text-muted-foreground">
                        Get detailed reports with specific HTML elements, clear explanations, and
                        step-by-step remediation guidance.
                      </p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
                    >
                      <h3 className="text-xl font-semibold mb-2">ADA Compliance</h3>
                      <p className="text-muted-foreground">
                        Ensure your website meets ADA requirements and Section 508 standards to
                        avoid legal issues.
                      </p>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Comparison Feature CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="max-w-4xl mx-auto pt-8"
                >
                  <div className="border rounded-lg p-8 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <GitCompare className="h-10 w-10 text-primary" />
                        <div>
                          <h3 className="text-xl font-semibold mb-1">Compare Scan Results</h3>
                          <p className="text-sm text-muted-foreground">
                            Track improvements and compare scans to see your progress over time
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setViewMode('compare')}
                        size="lg"
                        className="whitespace-nowrap"
                      >
                        <GitCompare className="mr-2 h-4 w-4" />
                        View Comparisons
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            Powered by axe-core | Built for accessibility professionals and developers
          </p>
        </div>
      </footer>
    </main>
  )
}
