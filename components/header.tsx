"use client"

import { Logo } from "./logo"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { Tooltip } from "./ui/tooltip"
import { RotateCcw, Keyboard, GitCompare } from "lucide-react"
import { motion } from "framer-motion"

interface HeaderProps {
  showNewScanButton?: boolean
  showCompareButton?: boolean
  onNewScan?: () => void
  onCompare?: () => void
  onShowKeyboardShortcuts?: () => void
}

export function Header({ showNewScanButton = false, showCompareButton = false, onNewScan, onCompare, onShowKeyboardShortcuts }: HeaderProps) {
  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />

        <div className="flex items-center gap-3">
          {showNewScanButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={onNewScan}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                New Scan
              </Button>
            </motion.div>
          )}

          {showCompareButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Tooltip content="Compare this scan with previous scans (Ctrl+C)">
                <Button
                  onClick={onCompare}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <GitCompare className="h-4 w-4" />
                  Compare Scans
                </Button>
              </Tooltip>
            </motion.div>
          )}

          <Tooltip content="Keyboard shortcuts (Ctrl+/)">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={onShowKeyboardShortcuts}
            >
              <Keyboard className="h-4 w-4" />
              <span className="sr-only">Keyboard shortcuts</span>
            </Button>
          </Tooltip>

          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  )
}
