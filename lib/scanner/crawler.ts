import type { ScanResult, ScanOptions } from './types'
import { AccessibilityScanner } from './engine'

export interface CrawlerOptions extends ScanOptions {
  maxPages?: number
  maxDepth?: number
  includePatterns?: string[]
  excludePatterns?: string[]
  sameDomainOnly?: boolean
  followExternalLinks?: boolean
}

export interface CrawlProgress {
  current: number
  total: number
  currentUrl: string
  status: 'crawling' | 'scanning' | 'complete' | 'error'
}

export interface CrawlResult {
  totalPages: number
  scannedPages: number
  totalViolations: number
  totalPasses: number
  totalIncomplete: number
  pages: ScanResult[]
  commonViolations: Array<{
    id: string
    help: string
    count: number
    severity: string
    urls: string[]
  }>
  startTime: string
  endTime: string
  duration: number
}

export class SiteCrawler {
  private scanner: AccessibilityScanner
  private visited: Set<string> = new Set()
  private queue: Array<{ url: string; depth: number }> = []
  private results: ScanResult[] = []
  private baseUrl: URL
  private options: CrawlerOptions
  private progressCallback?: (progress: CrawlProgress) => void

  constructor(scanner: AccessibilityScanner, options: CrawlerOptions = {}) {
    this.scanner = scanner
    this.options = {
      maxPages: options.maxPages || 10,
      maxDepth: options.maxDepth || 3,
      sameDomainOnly: options.sameDomainOnly !== false,
      followExternalLinks: options.followExternalLinks || false,
      includePatterns: options.includePatterns || [],
      excludePatterns: options.excludePatterns || [],
      ...options
    }
    this.baseUrl = new URL('http://example.com') // Will be set on crawl
  }

  setProgressCallback(callback: (progress: CrawlProgress) => void) {
    this.progressCallback = callback
  }

  private emitProgress(current: number, total: number, currentUrl: string, status: CrawlProgress['status']) {
    if (this.progressCallback) {
      this.progressCallback({ current, total, currentUrl, status })
    }
  }

  async crawlSite(startUrl: string): Promise<CrawlResult> {
    const startTime = Date.now()

    try {
      this.baseUrl = new URL(startUrl)
      this.visited.clear()
      this.queue = [{ url: startUrl, depth: 0 }]
      this.results = []

      while (this.queue.length > 0 && this.visited.size < this.options.maxPages!) {
        const { url, depth } = this.queue.shift()!

        if (this.visited.has(url) || depth > this.options.maxDepth!) {
          continue
        }

        if (!this.shouldCrawl(url)) {
          continue
        }

        this.visited.add(url)

        this.emitProgress(
          this.visited.size,
          Math.min(this.queue.length + this.visited.size, this.options.maxPages!),
          url,
          'scanning'
        )

        try {
          const result = await this.scanner.scanUrl(url, this.options)
          this.results.push(result)

          // Extract links if we haven't reached max depth
          if (depth < this.options.maxDepth!) {
            const links = await this.extractLinks(url)
            links.forEach(link => {
              if (!this.visited.has(link)) {
                this.queue.push({ url: link, depth: depth + 1 })
              }
            })
          }
        } catch (error) {
          console.error(`Error scanning ${url}:`, error)
        }
      }

      const endTime = Date.now()

      this.emitProgress(this.visited.size, this.visited.size, '', 'complete')

      return this.aggregateResults(startTime, endTime)
    } catch (error) {
      this.emitProgress(0, 0, '', 'error')
      throw error
    }
  }

  private shouldCrawl(url: string): boolean {
    try {
      const urlObj = new URL(url)

      // Check same domain
      if (this.options.sameDomainOnly && urlObj.hostname !== this.baseUrl.hostname) {
        return false
      }

      // Check include patterns
      if (this.options.includePatterns!.length > 0) {
        const matches = this.options.includePatterns!.some(pattern =>
          new RegExp(pattern).test(url)
        )
        if (!matches) return false
      }

      // Check exclude patterns
      if (this.options.excludePatterns!.length > 0) {
        const matches = this.options.excludePatterns!.some(pattern =>
          new RegExp(pattern).test(url)
        )
        if (matches) return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  private async extractLinks(url: string): Promise<string[]> {
    // This is a simplified version - in production, you'd use the browser page
    // For now, return empty array - links extraction happens in the scanner
    return []
  }

  private aggregateResults(startTime: number, endTime: number): CrawlResult {
    const totalViolations = this.results.reduce((sum, r) => sum + r.summary.violations, 0)
    const totalPasses = this.results.reduce((sum, r) => sum + r.summary.passes, 0)
    const totalIncomplete = this.results.reduce((sum, r) => sum + r.summary.incomplete, 0)

    // Find common violations across pages
    const violationMap = new Map<string, {
      id: string
      help: string
      severity: string
      urls: string[]
      count: number
    }>()

    this.results.forEach(result => {
      Object.values(result.violations).flat().forEach(violation => {
        const existing = violationMap.get(violation.id)
        if (existing) {
          existing.count++
          existing.urls.push(result.url)
        } else {
          violationMap.set(violation.id, {
            id: violation.id,
            help: violation.help,
            severity: violation.severity,
            urls: [result.url],
            count: 1
          })
        }
      })
    })

    const commonViolations = Array.from(violationMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalPages: this.visited.size,
      scannedPages: this.results.length,
      totalViolations,
      totalPasses,
      totalIncomplete,
      pages: this.results,
      commonViolations,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: endTime - startTime
    }
  }

  async crawlFromSitemap(sitemapUrl: string): Promise<CrawlResult> {
    // TODO: Implement sitemap parsing
    // For now, just crawl the sitemap URL itself
    return this.crawlSite(sitemapUrl)
  }
}

export async function createCrawler(options: CrawlerOptions = {}): Promise<SiteCrawler> {
  const scanner = new AccessibilityScanner()
  await scanner.initialize()
  return new SiteCrawler(scanner, options)
}
