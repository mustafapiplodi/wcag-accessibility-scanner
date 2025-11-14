import { NextRequest, NextResponse } from 'next/server'
import { createCrawler } from '@/lib/scanner/crawler'
import { rateLimit } from '@/lib/security/rate-limit'
import { sanitizeUrl, validateScanOptions, sanitizeRegex } from '@/lib/security/sanitize'

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 3, // 3 crawls per 5 minutes (more restrictive for multi-page scans)
  message: 'Too many crawl requests. Please try again later.'
})

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await limiter(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()
    const { url, options } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate and sanitize URL
    let sanitizedUrl: string
    try {
      sanitizedUrl = sanitizeUrl(url)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Validate scan options
    try {
      validateScanOptions(options || {})
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Sanitize regex patterns
    if (options?.includePatterns) {
      try {
        options.includePatterns = options.includePatterns.map((pattern: string) => sanitizeRegex(pattern))
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid include pattern regex' },
          { status: 400 }
        )
      }
    }

    if (options?.excludePatterns) {
      try {
        options.excludePatterns = options.excludePatterns.map((pattern: string) => sanitizeRegex(pattern))
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid exclude pattern regex' },
          { status: 400 }
        )
      }
    }

    // Create crawler with options
    const crawler = await createCrawler(options)

    // Start crawling
    const results = await crawler.crawlSite(sanitizedUrl)

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Crawl error:', error)
    return NextResponse.json(
      { error: error.message || 'Crawl failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'WCAG Multi-Page Crawler API',
    version: '1.0.0'
  })
}
