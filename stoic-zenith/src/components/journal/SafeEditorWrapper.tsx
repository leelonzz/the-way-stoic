import React, { Component, ReactNode } from 'react'

interface SafeEditorWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

interface SafeEditorWrapperState {
  hasError: boolean
  error?: Error
}

export class SafeEditorWrapper extends Component<SafeEditorWrapperProps, SafeEditorWrapperState> {
  constructor(props: SafeEditorWrapperProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): SafeEditorWrapperState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to console but don't crash the app
    if (error.message && error.message.includes('removeChild')) {
      // This is a known issue with DOM manipulation, we can safely ignore it
      console.warn('DOM manipulation warning (safely ignored):', error.message)
      // Reset error state after a brief delay
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined })
      }, 100)
    } else {
      console.error('Editor error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError && this.state.error?.message && !this.state.error.message.includes('removeChild')) {
      // Show fallback UI only for non-DOM manipulation errors
      return this.props.fallback || (
        <div className="p-6 text-center">
          <p className="text-red-500">Something went wrong with the editor.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-4 px-4 py-2 bg-stone-200 rounded hover:bg-stone-300"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
