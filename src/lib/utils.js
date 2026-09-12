import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes safely - combines clsx + tailwind-merge.
 * shadcn/ui requires this. Use everywhere class names are composed.
 *
 * @example cn('px-4 py-2', isActive && 'bg-purple-500', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Kenya Shillings.
 * @example formatCurrency(22000) → "KES 22,000"
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '-'
  return `KES ${Number(amount).toLocaleString('en-KE')}`
}

/**
 * Format a date string into a human-readable date.
 * @example formatDate('2025-06-01') → "1 Jun 2025"
 */
export function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-KE', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  })
}

/**
 * Format a date string as relative time.
 * @example formatRelativeDate('2025-05-31') → "2 days ago"
 */
export function formatRelativeDate(dateString) {
  if (!dateString) return '-'
  const date  = new Date(dateString)
  const now   = new Date()
  const diffMs = now - date
  const diffSecs  = Math.floor(diffMs / 1000)
  const diffMins  = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays  = Math.floor(diffHours / 24)

  if (diffSecs < 60)  return 'just now'
  if (diffMins < 60)  return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7)   return `${diffDays}d ago`
  return formatDate(dateString)
}

/**
 * Truncate a string with ellipsis.
 * @example truncateText('Long title here', 10) → "Long title..."
 */
export function truncateText(text, maxLength = 60) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

/**
 * Format a large number with K / M suffix.
 * @example formatCount(25000) → "25K"
 */
export function formatCount(num) {
  if (!num && num !== 0) return '-'
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000)     return `${(num / 1_000).toFixed(0)}K`
  return String(num)
}

/**
 * Get initials from a full name (max 2 letters).
 * @example getInitials('Amara Osei') → "AO"
 */
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

/**
 * Delay execution - useful for debouncing or artificial loading states.
 * @example await sleep(300)
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Simple debounce - returns a debounced version of the given function.
 */
export function debounce(fn, delay = 400) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
