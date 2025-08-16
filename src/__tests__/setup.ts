import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Global test setup
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.getSelection
Object.defineProperty(window, 'getSelection', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    rangeCount: 0,
    removeAllRanges: vi.fn(),
    addRange: vi.fn(),
    getRangeAt: vi.fn(),
  })),
})

// Mock document.createRange
Object.defineProperty(document, 'createRange', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    setStart: vi.fn(),
    setEnd: vi.fn(),
    collapse: vi.fn(),
    selectNodeContents: vi.fn(),
    cloneRange: vi.fn().mockReturnThis(),
    toString: vi.fn().mockReturnValue(''),
  })),
})
