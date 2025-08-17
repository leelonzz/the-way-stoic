/**
 * Date formatting utilities for consistent display across the application
 */

/**
 * Format a date string for display as "Last updated: Month Day, Year"
 * @param dateString - Date string in YYYY-MM-DD format or ISO format
 * @returns Formatted date string or null if invalid
 */
export function formatLastUpdatedDate(dateString: string | undefined | null): string | null {
  if (!dateString || dateString.trim() === '') {
    return null
  }

  try {
    const date = new Date(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null
    }

    // Format as "August 15, 2025"
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.warn('Error formatting date:', dateString, error)
    return null
  }
}

/**
 * Format a date string for display as "Last updated: Month Day, Year" with prefix
 * @param dateString - Date string in YYYY-MM-DD format or ISO format
 * @returns Formatted string with "Last updated: " prefix or null if invalid
 */
export function formatLastUpdatedWithPrefix(dateString: string | undefined | null): string | null {
  const formattedDate = formatLastUpdatedDate(dateString)
  return formattedDate ? `Last updated: ${formattedDate}` : null
}

/**
 * Get the current date in YYYY-MM-DD format for CSV storage
 * @returns Current date string
 */
export function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Check if a date string is valid
 * @param dateString - Date string to validate
 * @returns True if valid, false otherwise
 */
export function isValidDateString(dateString: string | undefined | null): boolean {
  if (!dateString || dateString.trim() === '') {
    return false
  }

  try {
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  } catch {
    return false
  }
}

/**
 * Format a date for SEO structured data (ISO format)
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns ISO formatted date string or null if invalid
 */
export function formatDateForStructuredData(dateString: string | undefined | null): string | null {
  if (!dateString || dateString.trim() === '') {
    return null
  }

  try {
    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      return null
    }

    return date.toISOString()
  } catch (error) {
    console.warn('Error formatting date for structured data:', dateString, error)
    return null
  }
}
