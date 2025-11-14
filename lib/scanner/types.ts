export interface ViolationNode {
  html: string
  target: string[]
  failureSummary: string
  fixes: any[]
}

export interface Violation {
  id: string
  description: string
  help: string
  helpUrl: string
  impact: string
  severity: string
  wcagTags: string[]
  nodes: ViolationNode[]
}

export interface ViolationCategories {
  perceivable: Violation[]
  operable: Violation[]
  understandable: Violation[]
  robust: Violation[]
  other: Violation[]
}

export interface ScanSummary {
  violations: number
  passes: number
  incomplete: number
  inapplicable: number
}

export interface ScanResult {
  url: string
  timestamp: string
  summary: ScanSummary
  violations: ViolationCategories
  incomplete: any[]
  passes: any[]
}

export interface ScanOptions {
  wcagLevel?: 'A' | 'AA' | 'AAA'
  runOnly?: string[]
}

// Re-export crawler types for convenience
export type { CrawlProgress, CrawlResult, CrawlerOptions } from './crawler'
