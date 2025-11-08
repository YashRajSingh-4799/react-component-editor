"use client"

import { useEffect, useState } from "react"
import * as React from "react"
import { useEditorStore } from "@/store/editor-store"
import * as Babel from "@babel/standalone"
import { ErrorBoundary } from "./ErrorBoundary"

export function Preview() {
  const code = useEditorStore((state) => state.code)
  const [Component, setComponent] = useState<React.ComponentType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [key, setKey] = useState(0)

  useEffect(() => {
    try {
      // Remove import statements as we'll provide React directly
      let processedCode = code.replace(/import.*from.*['"]react['"];?\n?/g, '')

      // Replace export default function with a function declaration
      processedCode = processedCode.replace(/export\s+default\s+function\s+(\w+)/g, 'function $1')
      processedCode = processedCode.replace(/export\s+default\s+/g, '')

      // Transform JSX to JavaScript using Babel
      const transformedCode = Babel.transform(processedCode, {
        presets: ["react", "typescript"],
        filename: "component.tsx",
      }).code

      // Wrap in a function and return the Component
      const wrappedCode = `
        ${transformedCode}
        return Component;
      `

      // Create a function with React and hooks in scope
      const componentFunction = new Function(
        "React",
        "useState",
        "useEffect",
        "useRef",
        "useMemo",
        "useCallback",
        "useContext",
        "useReducer",
        wrappedCode
      )

      // Execute the function to get the component, providing React hooks
      const CompiledComponent = componentFunction(
        React,
        React.useState,
        React.useEffect,
        React.useRef,
        React.useMemo,
        React.useCallback,
        React.useContext,
        React.useReducer
      )

      if (typeof CompiledComponent === 'function') {
        setComponent(() => CompiledComponent)
        setError(null)
        // Increment key to reset ErrorBoundary when component changes
        setKey(prev => prev + 1)
      } else {
        throw new Error('Component is not a function')
      }
    } catch (err: any) {
      console.error("Compilation error:", err)
      setError(err.message || "Failed to compile component")
      setComponent(null)
    }
  }, [code])

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="border border-destructive rounded-lg p-4 bg-destructive/10">
          <h3 className="text-destructive font-semibold mb-2">Compilation Error</h3>
          <pre className="text-sm text-muted-foreground overflow-auto">{error}</pre>
        </div>
      </div>
    )
  }

  if (!Component) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading preview...</p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        /* Default HTML styles for preview */
        .preview-content button {
          appearance: button;
          background-color: #e7e7e7;
          border: 1px solid #d3d3d3;
          border-radius: 4px;
          padding: 6px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: #000;
        }

        .preview-content button:hover {
          background-color: #d4d4d4;
        }

        .preview-content button:active {
          background-color: #c4c4c4;
        }

        .preview-content input,
        .preview-content textarea,
        .preview-content select {
          border: 1px solid #d3d3d3;
          border-radius: 4px;
          padding: 6px 12px;
          font-size: 14px;
          background-color: white;
          color: #000;
        }

        .preview-content input:focus,
        .preview-content textarea:focus,
        .preview-content select:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .preview-content a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .preview-content a:hover {
          color: #2563eb;
        }
      `}</style>
      <div className="h-full w-full overflow-auto">
        <div className="preview-content">
          <ErrorBoundary key={key}>
            <Component />
          </ErrorBoundary>
        </div>
      </div>
    </>
  )
}
