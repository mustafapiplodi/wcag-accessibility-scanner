"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileCode,
  QrCode,
  Mail,
  Loader2
} from "lucide-react"
import type { ScanResult } from "@/lib/scanner/types"
import {
  exportToJSON,
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportToHTML,
  generateQRCode,
  generateShareableLink
} from "@/lib/export-utils"
import toast from "react-hot-toast"
import { Card, CardContent } from "./ui/card"
import { motion, AnimatePresence } from "framer-motion"

interface ExportMenuProps {
  results: ScanResult
}

export function ExportMenu({ results }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [showQR, setShowQR] = useState(false)

  const handleExport = async (format: string, exportFn: () => void | Promise<void>) => {
    setLoading(format)
    try {
      await exportFn()
      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error(`Failed to export as ${format}`)
      console.error(error)
    } finally {
      setLoading(null)
      setIsOpen(false)
    }
  }

  const handleGenerateQR = async () => {
    setLoading('qr')
    try {
      const shareLink = generateShareableLink(results)
      const qr = await generateQRCode(shareLink)
      setQrCode(qr)
      setShowQR(true)
      toast.success('QR code generated!')
    } catch (error) {
      toast.error('Failed to generate QR code')
    } finally {
      setLoading(null)
    }
  }

  const handleEmailReport = () => {
    const subject = encodeURIComponent(`Accessibility Scan Report for ${results.url}`)
    const body = encodeURIComponent(`
Accessibility Scan Results

URL: ${results.url}
Scan Date: ${new Date(results.timestamp).toLocaleString()}

Summary:
- Violations: ${results.summary.violations}
- Passed: ${results.summary.passes}
- Needs Review: ${results.summary.incomplete}

View full report at: ${window.location.href}
    `)

    window.location.href = `mailto:?subject=${subject}&body=${body}`
    setIsOpen(false)
  }

  const exportOptions = [
    {
      id: 'pdf',
      label: 'Export as PDF',
      icon: FileText,
      color: 'text-red-600',
      action: () => handleExport('pdf', () => exportToPDF(results))
    },
    {
      id: 'excel',
      label: 'Export as Excel',
      icon: FileSpreadsheet,
      color: 'text-green-600',
      action: () => handleExport('excel', () => exportToExcel(results))
    },
    {
      id: 'csv',
      label: 'Export as CSV',
      icon: FileSpreadsheet,
      color: 'text-blue-600',
      action: () => handleExport('csv', () => exportToCSV(results))
    },
    {
      id: 'json',
      label: 'Export as JSON',
      icon: FileJson,
      color: 'text-yellow-600',
      action: () => handleExport('json', () => exportToJSON(results))
    },
    {
      id: 'html',
      label: 'Export as HTML',
      icon: FileCode,
      color: 'text-purple-600',
      action: () => handleExport('html', () => exportToHTML(results))
    },
    {
      id: 'qr',
      label: 'Generate QR Code',
      icon: QrCode,
      color: 'text-gray-600',
      action: handleGenerateQR
    },
    {
      id: 'email',
      label: 'Email Report',
      icon: Mail,
      color: 'text-indigo-600',
      action: handleEmailReport
    },
  ]

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export Report
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-64 z-50"
            >
              <Card>
                <CardContent className="p-2">
                  {exportOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={option.action}
                      disabled={loading !== null}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      {loading === option.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <option.icon className={`h-4 w-4 ${option.color}`} />
                      )}
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && qrCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background p-6 rounded-lg shadow-xl max-w-sm"
            >
              <h3 className="text-lg font-semibold mb-4">Scan to View Report</h3>
              <img src={qrCode} alt="QR Code" className="w-full" />
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Scan this QR code to view the report on your mobile device
              </p>
              <Button
                onClick={() => setShowQR(false)}
                className="w-full mt-4"
                variant="outline"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
