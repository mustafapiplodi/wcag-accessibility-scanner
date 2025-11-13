"use client"

import { Logo } from "./logo"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { RotateCcw } from "lucide-react"
import { motion } from "framer-motion"

interface HeaderProps {
  showNewScanButton?: boolean
  onNewScan?: () => void
}

export function Header({ showNewScanButton = false, onNewScan }: HeaderProps) {
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
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  )
}
