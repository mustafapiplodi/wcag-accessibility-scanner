"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Keyboard } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface KeyboardShortcutsProps {
  onNewScan?: () => void
  onCompare?: () => void
  onExport?: () => void
}

export function KeyboardShortcuts({ onNewScan, onCompare, onExport }: KeyboardShortcutsProps) {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Ctrl/Cmd + K: New Scan
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        onNewScan?.()
      }

      // Ctrl/Cmd + C: Compare Scans
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.shiftKey) {
        e.preventDefault()
        onCompare?.()
      }

      // Ctrl/Cmd + E: Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault()
        onExport?.()
      }

      // Ctrl/Cmd + /: Show keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setShowModal(true)
      }

      // Escape: Close modal
      if (e.key === 'Escape') {
        setShowModal(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNewScan, onCompare, onExport])

  const shortcuts = [
    { keys: ['Ctrl', 'K'], mac: ['⌘', 'K'], description: 'New Scan' },
    { keys: ['Ctrl', 'C'], mac: ['⌘', 'C'], description: 'Compare Scans' },
    { keys: ['Ctrl', 'E'], mac: ['⌘', 'E'], description: 'Export Results' },
    { keys: ['Ctrl', '/'], mac: ['⌘', '/'], description: 'Show Keyboard Shortcuts' },
    { keys: ['Esc'], mac: ['Esc'], description: 'Close Modal/Dialog' },
    { keys: ['Tab'], mac: ['Tab'], description: 'Navigate Forward' },
    { keys: ['Shift', 'Tab'], mac: ['⇧', 'Tab'], description: 'Navigate Backward' },
  ]

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  return (
    <>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Navigate and control the scanner efficiently with these keyboard shortcuts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <span className="text-sm">{shortcut.description}</span>
                <div className="flex gap-1">
                  {(isMac ? shortcut.mac : shortcut.keys).map((key, i) => (
                    <Badge key={i} variant="outline" className="font-mono">
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            <p>Press <Badge variant="outline" className="text-xs">Ctrl + /</Badge> or <Badge variant="outline" className="text-xs">⌘ + /</Badge> anytime to view this help</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
