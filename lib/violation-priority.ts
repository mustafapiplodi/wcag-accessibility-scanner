import type { Violation } from './scanner/types'

export type Priority = 'critical' | 'high' | 'medium' | 'low'

export interface PriorityInfo {
  level: Priority
  label: string
  color: string
  bgColor: string
  description: string
}

/**
 * Calculate priority level for a violation based on severity and impact
 */
export function getViolationPriority(violation: Violation): PriorityInfo {
  const { severity, nodes, impact } = violation
  const elementCount = nodes.length

  // Critical: Serious violations affecting many elements
  if (severity === 'critical' || (severity === 'serious' && elementCount > 5)) {
    return {
      level: 'critical',
      label: 'Critical',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-800',
      description: 'Fix immediately - major accessibility barrier'
    }
  }

  // High: Serious violations or moderate affecting many elements
  if (severity === 'serious' || (severity === 'moderate' && elementCount > 10)) {
    return {
      level: 'high',
      label: 'High',
      color: 'text-orange-700 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-800',
      description: 'Fix soon - significant accessibility issue'
    }
  }

  // Medium: Moderate violations or minor affecting many elements
  if (severity === 'moderate' || (severity === 'minor' && elementCount > 15)) {
    return {
      level: 'medium',
      label: 'Medium',
      color: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-800',
      description: 'Address when possible - moderate accessibility impact'
    }
  }

  // Low: Minor violations
  return {
    level: 'low',
    label: 'Low',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800',
    description: 'Improve over time - minor accessibility enhancement'
  }
}

/**
 * Get estimated time to fix based on priority and element count
 */
export function getEstimatedFixTime(violation: Violation): string {
  const elementCount = violation.nodes.length
  const priority = getViolationPriority(violation)

  if (priority.level === 'critical') {
    return elementCount > 10 ? '~2-4 hours' : '~30-60 min'
  }

  if (priority.level === 'high') {
    return elementCount > 10 ? '~1-2 hours' : '~15-30 min'
  }

  if (priority.level === 'medium') {
    return elementCount > 10 ? '~30-60 min' : '~10-20 min'
  }

  return elementCount > 10 ? '~20-30 min' : '~5-10 min'
}

/**
 * Identify "quick win" violations - easy to fix with high impact
 */
export function isQuickWin(violation: Violation): boolean {
  const elementCount = violation.nodes.length
  const priority = getViolationPriority(violation)

  // Quick wins are high priority issues affecting few elements
  // OR issues that are typically easy to fix regardless of priority
  const easyFixPatterns = [
    'image-alt',
    'label',
    'button-name',
    'link-name',
    'meta-viewport',
    'html-has-lang',
    'document-title'
  ]

  const isEasyFix = easyFixPatterns.some(pattern => violation.id.includes(pattern))

  return (priority.level === 'high' && elementCount <= 5) || isEasyFix
}
