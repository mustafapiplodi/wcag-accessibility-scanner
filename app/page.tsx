"use client"

import { useState } from "react"
import { EnhancedScanForm } from "@/components/scanner/enhanced-scan-form"
import { EnhancedResultsDashboard } from "@/components/scanner/enhanced-results-dashboard"
import { ScanProgress } from "@/components/scanner/scan-progress"
import { Header } from "@/components/header"
import type { ScanResult } from "@/lib/scanner/types"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
  const [isScanning, setIsScanning] = useState(false)
  const [results, setResults] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const handleNewScan = () => {
    setResults(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <Header showNewScanButton={!!results} onNewScan={handleNewScan} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <AnimatePresence mode="wait">
          {!results && !isScanning && (
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan Form */}
        {!results && !isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <EnhancedScanForm onScan={handleScan} isScanning={isScanning} />
          </motion.div>
        )}

        {/* Progress Indicator */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ScanProgress />
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

        {/* Results */}
        {results && !isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <EnhancedResultsDashboard results={results} />
          </motion.div>
        )}

        {/* Features Section */}
        {!results && !isScanning && (
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
