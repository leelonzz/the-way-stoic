import { LinkKeyword, LinkContext } from '@/types/linking'

// Manual link override interfaces
export interface LinkOverride {
  id: string
  pageId: string
  keyword: string
  url: string
  priority: number
  enabled: boolean
  wholeWordOnly: boolean
  maxOccurrences: number
  createdAt: string
  updatedAt: string
  createdBy?: string
  notes?: string
}

export interface LinkOverrideRule {
  pagePattern: string // Regex pattern to match page IDs
  keywords: LinkKeyword[]
  enabled: boolean
  description: string
}

export interface OverrideConfig {
  globalOverrides: LinkOverride[]
  pageSpecificOverrides: Record<string, LinkOverride[]>
  rules: LinkOverrideRule[]
  settings: {
    allowGlobalOverrides: boolean
    allowPageOverrides: boolean
    maxOverridesPerPage: number
    requireApproval: boolean
  }
}

// In-memory storage (in production, this would be in a database)
let overrideConfig: OverrideConfig = {
  globalOverrides: [],
  pageSpecificOverrides: {},
  rules: [],
  settings: {
    allowGlobalOverrides: true,
    allowPageOverrides: true,
    maxOverridesPerPage: 20,
    requireApproval: false
  }
}

// Load override configuration (would be from database in production)
export function loadOverrideConfig(): OverrideConfig {
  // In production, this would load from a database or API
  return overrideConfig
}

// Save override configuration
export function saveOverrideConfig(config: OverrideConfig): void {
  // In production, this would save to a database or API
  overrideConfig = config
}

// Create a new link override
export function createLinkOverride(
  pageId: string,
  keyword: string,
  url: string,
  options: Partial<LinkOverride> = {}
): LinkOverride {
  const override: LinkOverride = {
    id: generateId(),
    pageId,
    keyword,
    url,
    priority: options.priority || 100,
    enabled: options.enabled !== false,
    wholeWordOnly: options.wholeWordOnly !== false,
    maxOccurrences: options.maxOccurrences || 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: options.createdBy,
    notes: options.notes
  }

  const config = loadOverrideConfig()
  
  // Add to page-specific overrides
  if (!config.pageSpecificOverrides[pageId]) {
    config.pageSpecificOverrides[pageId] = []
  }
  
  // Check max overrides limit
  if (config.pageSpecificOverrides[pageId].length >= config.settings.maxOverridesPerPage) {
    throw new Error(`Maximum ${config.settings.maxOverridesPerPage} overrides per page exceeded`)
  }
  
  config.pageSpecificOverrides[pageId].push(override)
  saveOverrideConfig(config)
  
  return override
}

// Update an existing override
export function updateLinkOverride(
  overrideId: string,
  updates: Partial<LinkOverride>
): LinkOverride | null {
  const config = loadOverrideConfig()
  
  // Find and update in page-specific overrides
  for (const pageId in config.pageSpecificOverrides) {
    const overrides = config.pageSpecificOverrides[pageId]
    const index = overrides.findIndex(o => o.id === overrideId)
    
    if (index !== -1) {
      const updated = {
        ...overrides[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      overrides[index] = updated
      saveOverrideConfig(config)
      return updated
    }
  }
  
  // Check global overrides
  const globalIndex = config.globalOverrides.findIndex(o => o.id === overrideId)
  if (globalIndex !== -1) {
    const updated = {
      ...config.globalOverrides[globalIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    config.globalOverrides[globalIndex] = updated
    saveOverrideConfig(config)
    return updated
  }
  
  return null
}

// Delete an override
export function deleteLinkOverride(overrideId: string): boolean {
  const config = loadOverrideConfig()
  
  // Check page-specific overrides
  for (const pageId in config.pageSpecificOverrides) {
    const overrides = config.pageSpecificOverrides[pageId]
    const index = overrides.findIndex(o => o.id === overrideId)
    
    if (index !== -1) {
      overrides.splice(index, 1)
      saveOverrideConfig(config)
      return true
    }
  }
  
  // Check global overrides
  const globalIndex = config.globalOverrides.findIndex(o => o.id === overrideId)
  if (globalIndex !== -1) {
    config.globalOverrides.splice(globalIndex, 1)
    saveOverrideConfig(config)
    return true
  }
  
  return false
}

// Get overrides for a specific page
export function getPageOverrides(pageId: string): LinkOverride[] {
  const config = loadOverrideConfig()
  const pageOverrides = config.pageSpecificOverrides[pageId] || []
  const globalOverrides = config.settings.allowGlobalOverrides ? config.globalOverrides : []
  
  // Apply rules
  const ruleOverrides = applyRulesToPage(pageId)
  
  return [
    ...globalOverrides.filter(o => o.enabled),
    ...pageOverrides.filter(o => o.enabled),
    ...ruleOverrides
  ]
}

// Apply override rules to a page
function applyRulesToPage(pageId: string): LinkOverride[] {
  const config = loadOverrideConfig()
  const overrides: LinkOverride[] = []
  
  config.rules.forEach(rule => {
    if (!rule.enabled) return
    
    try {
      const pattern = new RegExp(rule.pagePattern)
      if (pattern.test(pageId)) {
        rule.keywords.forEach(keyword => {
          overrides.push({
            id: `rule-${generateId()}`,
            pageId,
            keyword: keyword.keyword,
            url: keyword.url,
            priority: keyword.priority,
            enabled: true,
            wholeWordOnly: keyword.wholeWordOnly !== false,
            maxOccurrences: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notes: `Applied from rule: ${rule.description}`
          })
        })
      }
    } catch (error) {
      console.warn(`Invalid regex pattern in rule: ${rule.pagePattern}`)
    }
  })
  
  return overrides
}

// Convert overrides to LinkKeyword format
export function overridesToKeywords(overrides: LinkOverride[]): LinkKeyword[] {
  return overrides.map(override => ({
    keyword: override.keyword,
    url: override.url,
    priority: override.priority,
    wholeWordOnly: override.wholeWordOnly
  }))
}

// Get enhanced keywords with overrides applied
export function getKeywordsWithOverrides(
  baseKeywords: LinkKeyword[],
  pageId: string
): LinkKeyword[] {
  const overrides = getPageOverrides(pageId)
  const overrideKeywords = overridesToKeywords(overrides)
  
  // Create a map to track override keywords
  const overrideMap = new Map<string, LinkKeyword>()
  overrideKeywords.forEach(keyword => {
    overrideMap.set(keyword.keyword.toLowerCase(), keyword)
  })
  
  // Filter out base keywords that are overridden
  const filteredBaseKeywords = baseKeywords.filter(keyword => 
    !overrideMap.has(keyword.keyword.toLowerCase())
  )
  
  // Combine and sort by priority
  return [...overrideKeywords, ...filteredBaseKeywords]
    .sort((a, b) => b.priority - a.priority)
}

// Create a rule-based override
export function createOverrideRule(
  pagePattern: string,
  keywords: LinkKeyword[],
  description: string,
  enabled: boolean = true
): LinkOverrideRule {
  const config = loadOverrideConfig()
  
  const rule: LinkOverrideRule = {
    pagePattern,
    keywords,
    enabled,
    description
  }
  
  config.rules.push(rule)
  saveOverrideConfig(config)
  
  return rule
}

// Bulk import overrides from JSON
export function importOverrides(data: {
  overrides?: LinkOverride[]
  rules?: LinkOverrideRule[]
}): { imported: number; errors: string[] } {
  const config = loadOverrideConfig()
  let imported = 0
  const errors: string[] = []
  
  // Import overrides
  if (data.overrides) {
    data.overrides.forEach((override, index) => {
      try {
        if (!override.pageId || !override.keyword || !override.url) {
          errors.push(`Override ${index}: Missing required fields`)
          return
        }
        
        const newOverride = {
          ...override,
          id: override.id || generateId(),
          createdAt: override.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        if (!config.pageSpecificOverrides[override.pageId]) {
          config.pageSpecificOverrides[override.pageId] = []
        }
        
        config.pageSpecificOverrides[override.pageId].push(newOverride)
        imported++
      } catch (error) {
        errors.push(`Override ${index}: ${error}`)
      }
    })
  }
  
  // Import rules
  if (data.rules) {
    data.rules.forEach((rule, index) => {
      try {
        if (!rule.pagePattern || !rule.keywords || !rule.description) {
          errors.push(`Rule ${index}: Missing required fields`)
          return
        }
        
        config.rules.push(rule)
        imported++
      } catch (error) {
        errors.push(`Rule ${index}: ${error}`)
      }
    })
  }
  
  saveOverrideConfig(config)
  return { imported, errors }
}

// Export overrides to JSON
export function exportOverrides(): {
  overrides: LinkOverride[]
  rules: LinkOverrideRule[]
  exportDate: string
} {
  const config = loadOverrideConfig()
  const allOverrides: LinkOverride[] = [
    ...config.globalOverrides,
    ...Object.values(config.pageSpecificOverrides).flat()
  ]
  
  return {
    overrides: allOverrides,
    rules: config.rules,
    exportDate: new Date().toISOString()
  }
}

// Generate a simple ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// Validate override data
export function validateOverride(override: Partial<LinkOverride>): string[] {
  const errors: string[] = []
  
  if (!override.keyword || override.keyword.trim().length === 0) {
    errors.push('Keyword is required')
  }
  
  if (!override.url || override.url.trim().length === 0) {
    errors.push('URL is required')
  }
  
  if (override.url && !isValidUrl(override.url)) {
    errors.push('URL must be a valid URL or path')
  }
  
  if (override.priority !== undefined && (override.priority < 0 || override.priority > 100)) {
    errors.push('Priority must be between 0 and 100')
  }
  
  if (override.maxOccurrences !== undefined && override.maxOccurrences < 1) {
    errors.push('Max occurrences must be at least 1')
  }
  
  return errors
}

// Simple URL validation
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    // Check if it's a valid path
    return url.startsWith('/') && url.length > 1
  }
}

// Get override statistics
export function getOverrideStats(): {
  totalOverrides: number
  pageSpecificOverrides: number
  globalOverrides: number
  activeRules: number
  pagesWithOverrides: number
} {
  const config = loadOverrideConfig()
  const pageSpecificCount = Object.values(config.pageSpecificOverrides)
    .flat()
    .filter(o => o.enabled).length

  return {
    totalOverrides: pageSpecificCount + config.globalOverrides.filter(o => o.enabled).length,
    pageSpecificOverrides: pageSpecificCount,
    globalOverrides: config.globalOverrides.filter(o => o.enabled).length,
    activeRules: config.rules.filter(r => r.enabled).length,
    pagesWithOverrides: Object.keys(config.pageSpecificOverrides).length
  }
}
