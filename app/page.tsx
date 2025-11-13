"use client"

import { useState } from "react"
import { ScanForm } from "@/components/scanner/scan-form"
import { ResultsDashboard } from "@/components/scanner/results-dashboard"
import { ThemeToggle } from "@/components/theme-toggle"
import type { ScanResult } from "@/lib/scanner/types"

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
      setError(err.message || 'An error occurred while scanning')
      console.error('Scan error:', err)
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">WCAG Scanner</h1>
            <p className="text-sm text-muted-foreground">
              Accessibility Testing Tool
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl font-bold tracking-tight">
            Free WCAG 2.2 Accessibility Scanner
          </h2>
          <p className="text-lg text-muted-foreground">
            Automatically scan your website for WCAG compliance issues and get actionable
            remediation guidance to prevent ADA lawsuits and improve web accessibility.
          </p>
        </div>

        {/* Scan Form */}
        <ScanForm onScan={handleScan} isScanning={isScanning} />

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive font-medium">Error: {error}</p>
          </div>
        )}

        {/* Results */}
        {results && <ResultsDashboard results={results} />}

        {/* Features Section */}
        {!results && (
          <div className="max-w-6xl mx-auto pt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-2">WCAG 2.2 Support</h3>
                <p className="text-muted-foreground">
                  Test against the latest WCAG 2.2 guidelines including new success criteria
                  for enhanced accessibility.
                </p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Actionable Results</h3>
                <p className="text-muted-foreground">
                  Get detailed reports with specific HTML elements, clear explanations, and
                  step-by-step remediation guidance.
                </p>
              </div>
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-2">ADA Compliance</h3>
                <p className="text-muted-foreground">
                  Ensure your website meets ADA requirements and Section 508 standards to
                  avoid legal issues.
                </p>
              </div>
            </div>
          </div>
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
