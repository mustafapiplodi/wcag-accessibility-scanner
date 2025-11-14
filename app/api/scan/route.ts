import { NextRequest, NextResponse } from 'next/server'
import { getScanner } from '@/lib/scanner/engine'
import { rateLimit } from '@/lib/security/rate-limit'
import { sanitizeUrl, isValidWcagLevel } from '@/lib/security/sanitize'

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 scans per minute
  message: 'Too many scan requests. Please try again later.'
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

    // Validate WCAG level
    if (options?.wcagLevel && !isValidWcagLevel(options.wcagLevel)) {
      return NextResponse.json(
        { error: 'Invalid WCAG level. Must be A, AA, or AAA' },
        { status: 400 }
      )
    }

    // Get scanner instance and perform scan
    const scanner = await getScanner()
    const results = await scanner.scanUrl(sanitizedUrl, options || {})

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Scan error:', error)
    return NextResponse.json(
      { error: error.message || 'Scan failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'WCAG Accessibility Scanner API',
    version: '1.0.0'
  })
}
