import { NextRequest, NextResponse } from 'next/server'
import { getScanner } from '@/lib/scanner/engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, options } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Get scanner instance and perform scan
    const scanner = await getScanner()
    const results = await scanner.scanUrl(url, options || {})

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
