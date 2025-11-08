"use client"

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when children change
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, error: null })
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="h-full w-full flex items-center justify-center p-4">
          <div className="border border-destructive rounded-lg p-4 bg-destructive/10 max-w-2xl">
            <h3 className="text-destructive font-semibold mb-2">Runtime Error</h3>
            <pre className="text-sm text-muted-foreground overflow-auto whitespace-pre-wrap">
              {this.state.error.message}
              {this.state.error.stack && '\n\n' + this.state.error.stack}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
