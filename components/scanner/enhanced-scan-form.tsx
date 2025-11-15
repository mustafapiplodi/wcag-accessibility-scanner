"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, Clock, Clipboard, X, ChevronDown } from "lucide-react"
import { Tooltip } from "@/components/ui/tooltip"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"

interface EnhancedScanFormProps {
  onScan: (url: string, options: { wcagLevel: string }) => Promise<void>
  isScanning: boolean
}

const EXAMPLE_URLS = [
  "https://www.w3.org",
  "https://www.google.com",
  "https://www.github.com",
  "https://www.npmjs.com",
]

const MAX_HISTORY = 5

export function EnhancedScanForm({ onScan, isScanning }: EnhancedScanFormProps) {
  const [url, setUrl] = useState("")
  const [wcagLevel, setWcagLevel] = useState("AA")
  const [urlError, setUrlError] = useState("")
  const [showExamples, setShowExamples] = useState(false)
  const [scanHistory, setScanHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Load scan history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("scanHistory")
    if (history) {
      setScanHistory(JSON.parse(history))
    }
  }, [])

  // Save to history
  const addToHistory = (url: string) => {
    const newHistory = [url, ...scanHistory.filter(h => h !== url)].slice(0, MAX_HISTORY)
    setScanHistory(newHistory)
    localStorage.setItem("scanHistory", JSON.stringify(newHistory))
  }

  // Real-time URL validation
  const validateUrl = (value: string) => {
    setUrl(value)

    if (!value) {
      setUrlError("")
      return
    }

    try {
      const urlObj = new URL(value)
      if (!urlObj.protocol.match(/^https?:$/)) {
        setUrlError("URL must use HTTP or HTTPS protocol")
      } else {
        setUrlError("")
      }
    } catch (error) {
      setUrlError("Invalid URL format")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (urlError || !url) {
      toast.error("Please enter a valid URL")
      return
    }

    try {
      await onScan(url, { wcagLevel })
      addToHistory(url)
      toast.success("Scan completed successfully!")
    } catch (error) {
      // Error handling in parent component
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      validateUrl(text)
      toast.success("URL pasted from clipboard")
    } catch (error) {
      toast.error("Failed to read from clipboard")
    }
  }

  const handleClearUrl = () => {
    setUrl("")
    setUrlError("")
  }

  const selectUrl = (selectedUrl: string) => {
    validateUrl(selectedUrl)
    setShowExamples(false)
    setShowHistory(false)
  }

  const getEstimatedTime = () => {
    return "~10-30 seconds"
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl">WCAG Accessibility Scanner</CardTitle>
        <CardDescription>
          Scan your website for WCAG 2.2, ADA, and Section 508 compliance issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium flex items-center gap-2">
              Website URL
              <span className="text-xs text-muted-foreground font-normal">
                (HTTP or HTTPS required)
              </span>
            </label>

            <div className="relative">
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => validateUrl(e.target.value)}
                placeholder="https://example.com"
                required
                disabled={isScanning}
                className={`w-full pr-24 ${urlError ? "border-destructive" : url ? "border-green-500" : ""}`}
              />

              {/* Quick Action Buttons */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                {url && !isScanning && (
                  <Tooltip content="Clear URL">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={handleClearUrl}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                )}

                {!isScanning && (
                  <Tooltip content="Paste from clipboard">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={handlePasteFromClipboard}
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* URL Validation Feedback */}
            <AnimatePresence>
              {urlError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-destructive"
                >
                  {urlError}
                </motion.p>
              )}
              {url && !urlError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-green-600 dark:text-green-500"
                >
                  ✓ Valid URL
                </motion.p>
              )}
            </AnimatePresence>

            {/* Example URLs */}
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowExamples(!showExamples)}
                disabled={isScanning}
                className="text-xs"
              >
                <ChevronDown className={`h-3 w-3 mr-1 transition-transform ${showExamples ? "rotate-180" : ""}`} />
                Try Examples
              </Button>

              {scanHistory.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  disabled={isScanning}
                  className="text-xs"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Recent Scans
                </Button>
              )}
            </div>

            {/* Examples Dropdown */}
            <AnimatePresence>
              {showExamples && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <p className="text-xs text-muted-foreground font-medium">Example URLs:</p>
                  <div className="grid gap-2">
                    {EXAMPLE_URLS.map((exampleUrl) => (
                      <button
                        key={exampleUrl}
                        type="button"
                        onClick={() => selectUrl(exampleUrl)}
                        className="text-left text-sm px-3 py-2 rounded hover:bg-accent transition-colors"
                      >
                        {exampleUrl}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* History Dropdown */}
            <AnimatePresence>
              {showHistory && scanHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <p className="text-xs text-muted-foreground font-medium">Recent Scans:</p>
                  <div className="grid gap-2">
                    {scanHistory.map((historyUrl, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectUrl(historyUrl)}
                        className="text-left text-sm px-3 py-2 rounded hover:bg-accent transition-colors flex items-center gap-2"
                      >
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {historyUrl}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* WCAG Level Selector */}
          <div className="space-y-2">
            <label htmlFor="wcag-level" className="text-sm font-medium flex items-center gap-2">
              WCAG Conformance Level
              <InfoTooltip content="AA (50 criteria) is recommended for ADA compliance. A (25 criteria) is minimum. AAA (78 criteria) is the highest standard." />
            </label>
            <select
              id="wcag-level"
              value={wcagLevel}
              onChange={(e) => setWcagLevel(e.target.value)}
              disabled={isScanning}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="A">Level A - Basic (25 criteria)</option>
              <option value="AA">Level AA - Recommended (50 criteria) ⭐</option>
              <option value="AAA">Level AAA - Enhanced (78 criteria)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Level AA meets ADA, Section 508, and most legal requirements
            </p>
          </div>

          {/* Estimated Time */}
          {url && !urlError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Clock className="h-4 w-4" />
              Estimated scan time: {getEstimatedTime()}
            </motion.div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isScanning || !!urlError || !url}
            className="w-full"
            size="lg"
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Scan Website
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
