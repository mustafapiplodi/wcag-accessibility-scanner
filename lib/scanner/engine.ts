import puppeteer, { Browser, Page } from 'puppeteer'
import axe from 'axe-core'
import type { ScanResult, ScanOptions, Violation, ViolationCategories, ViolationNode } from './types'

export class AccessibilityScanner {
  private browser: Browser | null = null

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
      })
    } catch (error) {
      console.error('Failed to initialize browser:', error)
      throw new Error('Browser initialization failed')
    }
  }

  async scanUrl(url: string, options: ScanOptions = {}): Promise<ScanResult> {
    if (!this.browser) {
      await this.initialize()
    }

    const page = await this.browser!.newPage()

    try {
      // Navigate to URL
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      })

      // Inject axe-core
      await page.addScriptTag({
        content: require('axe-core').source
      })

      // Configure axe options based on WCAG level
      const axeOptions: any = {
        runOnly: {
          type: 'tag',
          values: this.getWCAGTags(options.wcagLevel || 'AA')
        }
      }

      // Run axe-core analysis
      const results = await page.evaluate((opts) => {
        return new Promise((resolve) => {
          // @ts-ignore - axe is injected
          axe.run(opts, (err: any, results: any) => {
            if (err) throw err
            resolve(results)
          })
        })
      }, axeOptions)

      return this.parseResults(results as any)
    } catch (error: any) {
      throw new Error(`Scan failed for ${url}: ${error.message}`)
    } finally {
      await page.close()
    }
  }

  private getWCAGTags(level: 'A' | 'AA' | 'AAA'): string[] {
    const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']

    if (level === 'A') {
      return ['wcag2a', 'wcag21a', 'wcag22a']
    } else if (level === 'AAA') {
      return [...tags, 'wcag2aaa', 'wcag21aaa', 'wcag22aaa']
    }

    return tags
  }

  private parseResults(axeResults: any): ScanResult {
    const parsed: ScanResult = {
      url: axeResults.url,
      timestamp: axeResults.timestamp,
      summary: {
        violations: axeResults.violations.length,
        passes: axeResults.passes.length,
        incomplete: axeResults.incomplete.length,
        inapplicable: axeResults.inapplicable.length
      },
      violations: this.categorizeViolations(axeResults.violations),
      incomplete: axeResults.incomplete,
      passes: axeResults.passes
    }

    return parsed
  }

  private categorizeViolations(violations: any[]): ViolationCategories {
    const categories: ViolationCategories = {
      perceivable: [],
      operable: [],
      understandable: [],
      robust: [],
      other: []
    }

    violations.forEach(violation => {
      const category = this.getWCAGCategory(violation.tags)
      const severity = this.getSeverity(violation.impact)

      const formattedViolation: Violation = {
        id: violation.id,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        impact: violation.impact,
        severity: severity,
        wcagTags: violation.tags.filter((tag: string) => tag.startsWith('wcag')),
        nodes: violation.nodes.map((node: any) => ({
          html: node.html,
          target: node.target,
          failureSummary: node.failureSummary,
          fixes: node.any.concat(node.all, node.none)
        }))
      }

      categories[category].push(formattedViolation)
    })

    return categories
  }

  private getWCAGCategory(tags: string[]): keyof ViolationCategories {
    // Map WCAG tags to principles
    const tagString = tags.join(' ')

    if (tagString.match(/wcag\d+(1\.)/)) return 'perceivable'
    if (tagString.match(/wcag\d+(2\.)/)) return 'operable'
    if (tagString.match(/wcag\d+(3\.)/)) return 'understandable'
    if (tagString.match(/wcag\d+(4\.)/)) return 'robust'

    return 'other'
  }

  private getSeverity(impact: string): string {
    const severityMap: Record<string, string> = {
      'critical': 'critical',
      'serious': 'major',
      'moderate': 'moderate',
      'minor': 'minor'
    }
    return severityMap[impact] || 'unknown'
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}

// Singleton instance
let scannerInstance: AccessibilityScanner | null = null

export async function getScanner(): Promise<AccessibilityScanner> {
  if (!scannerInstance) {
    scannerInstance = new AccessibilityScanner()
    await scannerInstance.initialize()
  }
  return scannerInstance
}
