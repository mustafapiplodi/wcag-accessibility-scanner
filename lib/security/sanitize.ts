/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize URL to prevent XSS and injection attacks
 */
export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid protocol. Only HTTP and HTTPS are allowed.')
    }

    // Remove any javascript: or data: URLs
    if (url.toLowerCase().includes('javascript:') || url.toLowerCase().includes('data:')) {
      throw new Error('Invalid URL format')
    }

    return urlObj.toString()
  } catch (error) {
    throw new Error('Invalid URL format')
  }
}

/**
 * Sanitize HTML to prevent XSS
 * Basic implementation - for production, use DOMPurify or similar
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitize string to prevent SQL injection
 */
export function sanitizeString(str: string): string {
  return str.replace(/[<>\"'%;()&+]/g, '')
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate and sanitize number input
 */
export function sanitizeNumber(value: any, min?: number, max?: number): number {
  const num = parseInt(value, 10)

  if (isNaN(num)) {
    throw new Error('Invalid number format')
  }

  if (min !== undefined && num < min) {
    return min
  }

  if (max !== undefined && num > max) {
    return max
  }

  return num
}

/**
 * Validate WCAG level
 */
export function isValidWcagLevel(level: string): level is 'A' | 'AA' | 'AAA' {
  return ['A', 'AA', 'AAA'].includes(level)
}

/**
 * Sanitize file path to prevent directory traversal
 */
export function sanitizeFilePath(path: string): string {
  // Remove any ../ or ..\ patterns
  return path.replace(/\.\.[/\\]/g, '')
}

/**
 * Validate and sanitize regex pattern
 */
export function sanitizeRegex(pattern: string): string {
  try {
    // Try to create a RegExp to validate it
    new RegExp(pattern)
    return pattern
  } catch (error) {
    throw new Error('Invalid regex pattern')
  }
}

/**
 * Sanitize object by removing dangerous keys
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const dangerousKeys = ['__proto__', 'constructor', 'prototype']
  const sanitized: any = {}

  for (const key in obj) {
    if (!dangerousKeys.includes(key)) {
      sanitized[key] = obj[key]
    }
  }

  return sanitized
}

/**
 * Rate limit scan options to prevent abuse
 */
export function validateScanOptions(options: any): void {
  if (options.maxPages && options.maxPages > 100) {
    throw new Error('Maximum pages cannot exceed 100')
  }

  if (options.maxDepth && options.maxDepth > 10) {
    throw new Error('Maximum depth cannot exceed 10')
  }

  if (options.includePatterns && options.includePatterns.length > 20) {
    throw new Error('Too many include patterns (max: 20)')
  }

  if (options.excludePatterns && options.excludePatterns.length > 20) {
    throw new Error('Too many exclude patterns (max: 20)')
  }
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(token: string, expected: string): boolean {
  if (!token || !expected) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  if (token.length !== expected.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expected.charCodeAt(i)
  }

  return result === 0
}
