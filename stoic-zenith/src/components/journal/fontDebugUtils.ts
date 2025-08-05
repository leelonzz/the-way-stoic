/**
 * Font debugging utilities for testing typography-aware text selection
 */

import { getFontMetrics, isFontLoaded, measureText } from './fontUtils'

export interface FontDebugInfo {
  element: HTMLElement
  fontMetrics: any
  isLoaded: boolean
  textMeasurement: any
  blockId: string | null
}

/**
 * Get comprehensive font debug information for an element
 */
export function getElementFontDebugInfo(element: HTMLElement): FontDebugInfo {
  const fontMetrics = getFontMetrics(element)
  const sampleText = element.textContent?.substring(0, 20) || 'Sample text'
  const textMeasurement = measureText(sampleText, element)
  const blockId = element.closest('[data-block-id]')?.getAttribute('data-block-id') || null

  return {
    element,
    fontMetrics,
    isLoaded: isFontLoaded(fontMetrics.fontFamily),
    textMeasurement,
    blockId,
  }
}

/**
 * Debug all text blocks in the editor
 */
export function debugAllBlocks(editorElement: HTMLElement): FontDebugInfo[] {
  const blocks = editorElement.querySelectorAll('[data-block-id] [contenteditable]')
  return Array.from(blocks).map(block => getElementFontDebugInfo(block as HTMLElement))
}

/**
 * Log font debug information to console
 */
export function logFontDebugInfo(debugInfo: FontDebugInfo[]): void {
  console.group('Font Debug Information')
  
  debugInfo.forEach((info, index) => {
    console.group(`Block ${index + 1} (ID: ${info.blockId})`)
    console.log('Font Family:', info.fontMetrics.fontFamily)
    console.log('Font Size:', info.fontMetrics.fontSize)
    console.log('Font Weight:', info.fontMetrics.fontWeight)
    console.log('Font Loaded:', info.isLoaded)
    console.log('Text Sample:', info.element.textContent?.substring(0, 30) + '...')
    console.log('Character Width:', info.textMeasurement.characterWidth)
    console.log('Text Width:', info.textMeasurement.width)
    console.groupEnd()
  })
  
  console.groupEnd()
}

/**
 * Add visual debug indicators to blocks
 */
export function addVisualDebugIndicators(editorElement: HTMLElement): void {
  const blocks = editorElement.querySelectorAll('[data-block-id]')
  
  blocks.forEach((block, index) => {
    const contentEditable = block.querySelector('[contenteditable]') as HTMLElement
    if (!contentEditable) return
    
    const debugInfo = getElementFontDebugInfo(contentEditable)
    
    // Create debug overlay
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: absolute;
      top: -25px;
      left: 0;
      font-size: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      z-index: 1000;
      pointer-events: none;
      font-family: monospace;
    `
    
    const fontName = debugInfo.fontMetrics.fontFamily.split(',')[0].replace(/['"]/g, '')
    const loadedStatus = debugInfo.isLoaded ? '✓' : '✗'
    overlay.textContent = `${fontName} ${loadedStatus} | CW: ${debugInfo.textMeasurement.characterWidth.toFixed(1)}px`
    
    // Position relative to block
    const blockElement = block as HTMLElement
    blockElement.style.position = 'relative'
    blockElement.appendChild(overlay)
  })
}

/**
 * Remove visual debug indicators
 */
export function removeVisualDebugIndicators(editorElement: HTMLElement): void {
  const overlays = editorElement.querySelectorAll('[style*="z-index: 1000"]')
  overlays.forEach(overlay => overlay.remove())
}

/**
 * Test text selection accuracy across different fonts
 */
export function testSelectionAccuracy(editorElement: HTMLElement): void {
  const blocks = debugAllBlocks(editorElement)
  
  console.group('Selection Accuracy Test')
  
  blocks.forEach((blockInfo, index) => {
    const element = blockInfo.element
    const text = element.textContent || ''
    
    if (text.length === 0) return
    
    console.group(`Testing Block ${index + 1}`)
    
    // Test selection at different positions
    const testPositions = [0, Math.floor(text.length / 4), Math.floor(text.length / 2), Math.floor(text.length * 3 / 4), text.length]
    
    testPositions.forEach(pos => {
      try {
        const range = document.createRange()
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null)
        
        let currentOffset = 0
        let node = walker.nextNode()
        
        while (node && currentOffset + (node.textContent?.length || 0) < pos) {
          currentOffset += node.textContent?.length || 0
          node = walker.nextNode()
        }
        
        if (node) {
          const offsetInNode = pos - currentOffset
          range.setStart(node, Math.min(offsetInNode, node.textContent?.length || 0))
          range.collapse(true)
          
          const rect = range.getBoundingClientRect()
          console.log(`Position ${pos}: x=${rect.x.toFixed(1)}, y=${rect.y.toFixed(1)}`)
        }
      } catch (error) {
        console.warn(`Failed to test position ${pos}:`, error)
      }
    })
    
    console.groupEnd()
  })
  
  console.groupEnd()
}

/**
 * Global debug functions for browser console
 */
declare global {
  interface Window {
    fontDebug: {
      debugAllBlocks: () => void
      addVisualIndicators: () => void
      removeVisualIndicators: () => void
      testSelectionAccuracy: () => void
    }
  }
}

/**
 * Initialize global debug functions
 */
export function initializeFontDebugGlobals(): void {
  window.fontDebug = {
    debugAllBlocks: () => {
      const editor = document.querySelector('[contenteditable]')?.closest('.editor-container') as HTMLElement
      if (editor) {
        const debugInfo = debugAllBlocks(editor)
        logFontDebugInfo(debugInfo)
      } else {
        console.warn('Editor not found')
      }
    },
    
    addVisualIndicators: () => {
      const editor = document.querySelector('[contenteditable]')?.closest('.editor-container') as HTMLElement
      if (editor) {
        addVisualDebugIndicators(editor)
      } else {
        console.warn('Editor not found')
      }
    },
    
    removeVisualIndicators: () => {
      const editor = document.querySelector('[contenteditable]')?.closest('.editor-container') as HTMLElement
      if (editor) {
        removeVisualDebugIndicators(editor)
      } else {
        console.warn('Editor not found')
      }
    },
    
    testSelectionAccuracy: () => {
      const editor = document.querySelector('[contenteditable]')?.closest('.editor-container') as HTMLElement
      if (editor) {
        testSelectionAccuracy(editor)
      } else {
        console.warn('Editor not found')
      }
    }
  }
  
  console.log('Font debug utilities available at window.fontDebug')
  console.log('Available methods: debugAllBlocks(), addVisualIndicators(), removeVisualIndicators(), testSelectionAccuracy()')
}
