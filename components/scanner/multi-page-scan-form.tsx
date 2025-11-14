"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Globe, Settings2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Separator } from "@/components/ui/separator"

interface MultiPageScanFormProps {
  onScan: (url: string, options: any) => Promise<void>
  isScanning: boolean
}

export function MultiPageScanForm({ onScan, isScanning }: MultiPageScanFormProps) {
  const [url, setUrl] = useState("")
  const [maxPages, setMaxPages] = useState(10)
  const [maxDepth, setMaxDepth] = useState(3)
  const [wcagLevel, setWcagLevel] = useState("AA")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [includePatterns, setIncludePatterns] = useState("")
  const [excludePatterns, setExcludePatterns] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (url) {
      await onScan(url, {
        maxPages,
        maxDepth,
        wcagLevel,
        includePatterns: includePatterns ? includePatterns.split(',').map(p => p.trim()) : [],
        excludePatterns: excludePatterns ? excludePatterns.split(',').map(p => p.trim()) : [],
      })
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-6 w-6" />
          Multi-Page Site Scan
        </CardTitle>
        <CardDescription>
          Scan multiple pages of your website for comprehensive accessibility analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <label htmlFor="crawl-url" className="text-sm font-medium">
              Starting URL
            </label>
            <Input
              id="crawl-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              disabled={isScanning}
            />
            <p className="text-xs text-muted-foreground">
              The crawler will start from this page and follow links
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Max Pages */}
            <div className="space-y-2">
              <label htmlFor="max-pages" className="text-sm font-medium">
                Max Pages
              </label>
              <Input
                id="max-pages"
                type="number"
                min={1}
                max={100}
                value={maxPages}
                onChange={(e) => setMaxPages(parseInt(e.target.value))}
                disabled={isScanning}
              />
              <p className="text-xs text-muted-foreground">
                Maximum pages to scan
              </p>
            </div>

            {/* Max Depth */}
            <div className="space-y-2">
              <label htmlFor="max-depth" className="text-sm font-medium">
                Max Depth
              </label>
              <Input
                id="max-depth"
                type="number"
                min={1}
                max={10}
                value={maxDepth}
                onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                disabled={isScanning}
              />
              <p className="text-xs text-muted-foreground">
                How deep to crawl
              </p>
            </div>

            {/* WCAG Level */}
            <div className="space-y-2">
              <label htmlFor="crawl-wcag-level" className="text-sm font-medium">
                WCAG Level
              </label>
              <select
                id="crawl-wcag-level"
                value={wcagLevel}
                onChange={(e) => setWcagLevel(e.target.value)}
                disabled={isScanning}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="A">Level A</option>
                <option value="AA">Level AA</option>
                <option value="AAA">Level AAA</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={isScanning}
              className="gap-2"
            >
              <Settings2 className="h-4 w-4" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4"
                >
                  <Separator />

                  <div className="space-y-2">
                    <label htmlFor="include-patterns" className="text-sm font-medium">
                      Include URL Patterns (comma-separated regex)
                    </label>
                    <Input
                      id="include-patterns"
                      value={includePatterns}
                      onChange={(e) => setIncludePatterns(e.target.value)}
                      placeholder="/blog/.*, /products/.*"
                      disabled={isScanning}
                    />
                    <p className="text-xs text-muted-foreground">
                      Only scan URLs matching these patterns (leave empty for all)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="exclude-patterns" className="text-sm font-medium">
                      Exclude URL Patterns (comma-separated regex)
                    </label>
                    <Input
                      id="exclude-patterns"
                      value={excludePatterns}
                      onChange={(e) => setExcludePatterns(e.target.value)}
                      placeholder="/admin/.*, /login, /logout"
                      disabled={isScanning}
                    />
                    <p className="text-xs text-muted-foreground">
                      Skip URLs matching these patterns
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button type="submit" disabled={isScanning} className="w-full" size="lg">
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning Site...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Start Multi-Page Scan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
