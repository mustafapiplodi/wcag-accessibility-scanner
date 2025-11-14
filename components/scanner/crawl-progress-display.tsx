"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import type { CrawlProgress } from "@/lib/scanner/crawler"

interface CrawlProgressDisplayProps {
  progress: CrawlProgress
}

export function CrawlProgressDisplay({ progress }: CrawlProgressDisplayProps) {
  const percentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Crawling Website</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">
              {progress.current} / {progress.total} pages
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={
              progress.status === 'complete' ? 'default' :
              progress.status === 'error' ? 'destructive' :
              'secondary'
            }>
              {progress.status}
            </Badge>
            <span className="text-sm text-muted-foreground truncate">
              {progress.currentUrl}
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground"
        >
          This may take a few minutes depending on the site size...
        </motion.div>
      </CardContent>
    </Card>
  )
}
