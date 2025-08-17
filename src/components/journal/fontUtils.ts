/**
 * Font utilities for handling typography-aware text measurements and selection
 */

export interface FontMetrics {
  fontFamily: string
  fontSize: string
  fontWeight: string
  lineHeight: string
  loaded: boolean
}

export interface TextMeasurement {
  width: number
  height: number
  characterWidth: number
}

/**
 * Get computed font metrics for an element
 */
export function getFontMetrics(element: HTMLElement): FontMetrics {
  const computedStyle = window.getComputedStyle(element)
  const fontFamily = computedStyle.fontFamily
  
  return {
    fontFamily,
    fontSize: computedStyle.fontSize,
    fontWeight: computedStyle.fontWeight,
    lineHeight: computedStyle.lineHeight,
    loaded: isFontLoaded(fontFamily),
  }
}

/**
 * Check if a font is loaded
 */
export function isFontLoaded(fontFamily: string): boolean {
  if (!('fonts' in document)) return true
  
  try {
    // Clean up font family string for checking
    const cleanFontFamily = fontFamily
      .replace(/['"]/g, '')
      .split(',')[0]
      .trim()
    
    return (
      document.fonts.check(`16px "${cleanFontFamily}"`) ||
      document.fonts.check(`16px ${cleanFontFamily}`) ||
      document.fonts.check(`16px "${fontFamily}"`)
    )
  } catch (error) {
    console.warn('Font loading check failed:', error)
    return true // Assume loaded to avoid blocking
  }
}

/**
 * Wait for a font to load with timeout
 */
export async function waitForFontLoad(
  fontFamily: string,
  timeout: number = 2000
): Promise<boolean> {
  if (!('fonts' in document)) return true
  
  try {
    // Check if already loaded
    if (isFontLoaded(fontFamily)) {
      return true
    }
    
    // Clean up font family string
    const cleanFontFamily = fontFamily
      .replace(/['"]/g, '')
      .split(',')[0]
      .trim()
    
    // Wait for font to load with timeout
    const fontLoadPromise = document.fonts.load(`16px "${cleanFontFamily}"`)
    const timeoutPromise = new Promise<void>((resolve) => 
      setTimeout(resolve, timeout)
    )
    
    await Promise.race([fontLoadPromise, timeoutPromise])
    
    return isFontLoaded(fontFamily)
  } catch (error) {
    console.warn('Font loading failed:', error)
    return true // Assume loaded to avoid blocking
  }
}

/**
 * Measure text with current font metrics
 */
export function measureText(
  text: string,
  element: HTMLElement
): TextMeasurement {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  
  if (!context) {
    return { width: text.length * 8, height: 16, characterWidth: 8 }
  }
  
  const computedStyle = window.getComputedStyle(element)
  context.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`
  
  const metrics = context.measureText(text)
  const width = metrics.width
  const height = parseFloat(computedStyle.fontSize) || 16
  
  return {
    width,
    height,
    characterWidth: text.length > 0 ? width / text.length : 8,
  }
}

/**
 * Get accurate text offset using font-aware measurements
 */
export function getFontAwareTextOffset(
  textNode: Node,
  charOffset: number,
  blockElement: HTMLElement
): number {
  try {
    const walker = document.createTreeWalker(
      blockElement,
      NodeFilter.SHOW_TEXT,
      null
    )

    let totalOffset = 0
    let node = walker.nextNode()

    while (node) {
      if (node === textNode) {
        return totalOffset + charOffset
      }
      totalOffset += node.textContent?.length || 0
      node = walker.nextNode()
    }

    return totalOffset
  } catch (error) {
    console.warn('Font-aware text offset calculation failed:', error)
    return charOffset
  }
}

/**
 * Set cursor position with font awareness
 */
export function setFontAwareCursor(
  blockElement: HTMLElement,
  textOffset: number
): void {
  try {
    const walker = document.createTreeWalker(
      blockElement,
      NodeFilter.SHOW_TEXT,
      null
    )

    let currentOffset = 0
    let node = walker.nextNode()

    while (node) {
      const nodeLength = node.textContent?.length || 0
      if (currentOffset + nodeLength >= textOffset) {
        const range = document.createRange()
        const offsetInNode = textOffset - currentOffset
        range.setStart(node, Math.min(offsetInNode, nodeLength))
        range.collapse(true)
        
        const selection = window.getSelection()
        if (selection) {
          selection.removeAllRanges()
          selection.addRange(range)
        }
        return
      }
      currentOffset += nodeLength
      node = walker.nextNode()
    }

    // Fallback: position at end
    const range = document.createRange()
    range.selectNodeContents(blockElement)
    range.collapse(false)
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)
    }
  } catch (error) {
    console.warn('Font-aware cursor positioning failed:', error)
  }
}

/**
 * Create font-aware selection range
 */
export function createFontAwareRange(
  startElement: HTMLElement,
  startOffset: number,
  endElement: HTMLElement,
  endOffset: number
): Range | null {
  try {
    const range = document.createRange()
    
    // Find text nodes and set precise positions
    const startTextNode = findTextNodeAtOffset(startElement, startOffset)
    const endTextNode = findTextNodeAtOffset(endElement, endOffset)
    
    if (startTextNode && endTextNode) {
      range.setStart(startTextNode.node, startTextNode.offset)
      range.setEnd(endTextNode.node, endTextNode.offset)
      return range
    }
    
    return null
  } catch (error) {
    console.warn('Font-aware range creation failed:', error)
    return null
  }
}

/**
 * Find text node at specific offset
 */
function findTextNodeAtOffset(
  element: HTMLElement,
  offset: number
): { node: Node; offset: number } | null {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  )

  let currentOffset = 0
  let node = walker.nextNode()

  while (node) {
    const nodeLength = node.textContent?.length || 0
    if (currentOffset + nodeLength >= offset) {
      return {
        node,
        offset: offset - currentOffset,
      }
    }
    currentOffset += nodeLength
    node = walker.nextNode()
  }

  return null
}

/**
 * Initialize font loading detection for the application
 */
export function initializeFontDetection(): void {
  // Add font loading event listeners
  if ('fonts' in document) {
    document.fonts.addEventListener('loadingdone', () => {
      // Dispatch custom event when fonts are loaded
      window.dispatchEvent(new CustomEvent('fonts-loaded'))
    })
  }
  
  // Check for Inknut Antiqua specifically
  const checkInknutLoading = async () => {
    try {
      await waitForFontLoad('Inknut Antiqua')
      document.documentElement.classList.add('inknut-loaded')
      window.dispatchEvent(new CustomEvent('inknut-font-loaded'))
    } catch (error) {
      console.warn('Inknut Antiqua loading check failed:', error)
    }
  }
  
  // Run check after a short delay to allow fonts to load
  setTimeout(checkInknutLoading, 100)
}
