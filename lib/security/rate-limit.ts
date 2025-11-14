import { NextRequest, NextResponse } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const store: RateLimitStore = {}

export interface RateLimitOptions {
  windowMs?: number // Time window in milliseconds
  maxRequests?: number // Maximum requests per window
  message?: string // Error message
  statusCode?: number // HTTP status code for rate limit exceeded
}

/**
 * Rate limiting middleware to prevent abuse
 * Uses in-memory storage (for production, use Redis or similar)
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute default
    maxRequests = 10, // 10 requests per minute default
    message = 'Too many requests, please try again later',
    statusCode = 429
  } = options

  return async function (request: NextRequest): Promise<NextResponse | null> {
    // Get identifier (IP address or user ID)
    const identifier = getIdentifier(request)

    const now = Date.now()
    const record = store[identifier]

    // Initialize or reset if window has passed
    if (!record || now > record.resetAt) {
      store[identifier] = {
        count: 1,
        resetAt: now + windowMs
      }
      return null // Allow request
    }

    // Increment count
    record.count++

    // Check if limit exceeded
    if (record.count > maxRequests) {
      return NextResponse.json(
        {
          error: message,
          retryAfter: Math.ceil((record.resetAt - now) / 1000)
        },
        { status: statusCode }
      )
    }

    return null // Allow request
  }
}

/**
 * Get identifier for rate limiting
 * Priority: User ID > API Key > IP Address
 */
function getIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    return `user:${authHeader.substring(0, 20)}`
  }

  // Try to get API key
  const apiKey = request.headers.get('x-api-key')
  if (apiKey) {
    return `api:${apiKey}`
  }

  // Fall back to IP address
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor ? forwardedFor.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

  return `ip:${ip}`
}

/**
 * Clean up old entries from the store
 * Should be called periodically
 */
export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const key in store) {
    if (store[key].resetAt < now) {
      delete store[key]
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}
