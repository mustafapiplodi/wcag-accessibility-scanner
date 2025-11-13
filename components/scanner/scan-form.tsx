"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search } from "lucide-react"

interface ScanFormProps {
  onScan: (url: string, options: { wcagLevel: string }) => Promise<void>
  isScanning: boolean
}

export function ScanForm({ onScan, isScanning }: ScanFormProps) {
  const [url, setUrl] = useState("")
  const [wcagLevel, setWcagLevel] = useState("AA")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (url) {
      await onScan(url, { wcagLevel })
    }
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
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              Website URL
            </label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              disabled={isScanning}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="wcag-level" className="text-sm font-medium">
              WCAG Conformance Level
            </label>
            <select
              id="wcag-level"
              value={wcagLevel}
              onChange={(e) => setWcagLevel(e.target.value)}
              disabled={isScanning}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="A">Level A (Minimum)</option>
              <option value="AA">Level AA (Recommended)</option>
              <option value="AAA">Level AAA (Enhanced)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Level AA is recommended for most websites and required for ADA compliance
            </p>
          </div>

          <Button type="submit" disabled={isScanning} className="w-full" size="lg">
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
