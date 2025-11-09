"use client"

import { useEffect, useState, useRef } from "react"
import * as React from "react"
import * as Babel from "@babel/standalone"
import { useEditorStore } from "@/store/editor-store"
import { ErrorBoundary } from "./ErrorBoundary"
import { StyleEditor } from "./StyleEditor"
import { PreviewHint } from "./PreviewHint"
import { generateNodeId, getComputedStyles } from "@/lib/style-utils"
import { BABEL_PRESETS, BABEL_FILENAME } from "@/constants/editor"

/**
 * Preview Component
 * Renders and displays the compiled React component with live editing capabilities
 */
export function Preview() {
  const code = useEditorStore((state) => state.code)
  const styleOverrides = useEditorStore((state) => state.styleOverrides)
  const selectNode = useEditorStore((state) => state.selectNode)
  const setPopoverState = useEditorStore((state) => state.setPopoverState)
  const clearSelection = useEditorStore((state) => state.clearSelection)

  const [Component, setComponent] = useState<React.ComponentType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [key, setKey] = useState(0)
  const previewRef = useRef<HTMLDivElement>(null)

  /**
   * Compile the user's code into a React component
   */
  useEffect(() => {
    try {
      // Remove import statements as we'll provide React directly
      let processedCode = code.replace(/import.*from.*['"]react['"];?\n?/g, '')

      // Replace export default function with a function declaration
      processedCode = processedCode.replace(/export\s+default\s+function\s+(\w+)/g, 'function $1')
      processedCode = processedCode.replace(/export\s+default\s+/g, '')

      // Transform JSX to JavaScript using Babel
      const transformedCode = Babel.transform(processedCode, {
        presets: BABEL_PRESETS,
        filename: BABEL_FILENAME,
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
        setKey((prev) => prev + 1)
      } else {
        throw new Error('Component is not a function')
      }
    } catch (err: any) {
      console.error("Compilation error:", err)
      setError(err.message || "Failed to compile component")
      setComponent(null)
    }
  }, [code])

  /**
   * Handle element selection for style editing
   * Users hold Alt/Option key and click elements to select them
   */
  useEffect(() => {
    const previewContent = previewRef.current?.querySelector('.preview-content')
    if (!previewContent) {
      return
    }

    /**
     * Handle click events for element selection
     * Only activates when Alt/Option key is held
     */
    const handleClick = (e: Event) => {
      const mouseEvent = e as MouseEvent
      const target = mouseEvent.target as HTMLElement

      // Ignore clicks on the preview container itself
      if (target.classList.contains('preview-content')) return

      // Ignore clicks on the popover/style editor
      if (target.closest('.style-editor-popover')) return

      // Only allow selection when Alt/Option key is held
      // This lets the preview work normally, and users explicitly enter "selection mode" with Alt
      if (!mouseEvent.altKey) {
        return
      }

      // Prevent default behavior for selection
      mouseEvent.stopPropagation()
      mouseEvent.preventDefault()

      const nodeId = generateNodeId(target)
      const computedStyles = getComputedStyles(target)

      // Calculate popover position (centered horizontally, below the element)
      const rect = target.getBoundingClientRect()
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10,
      }

      selectNode({
        nodeId,
        element: target,
        computedStyles,
      })

      setPopoverState(true, position)
    }

    /**
     * Handle clicks outside the preview to clear selection
     */
    const handleClickOutside = (e: Event) => {
      const mouseEvent = e as MouseEvent
      const target = mouseEvent.target as HTMLElement

      if (!previewContent.contains(target) && !target.closest('.style-editor-popover')) {
        clearSelection()
      }
    }

    /**
     * Handle Escape key to clear selection
     */
    const handleKeyDown = (e: Event) => {
      const keyboardEvent = e as KeyboardEvent
      if (keyboardEvent.key === 'Escape') {
        clearSelection()
      }
    }

    // Register event listeners
    previewContent.addEventListener('click', handleClick, true)
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      previewContent.removeEventListener('click', handleClick, true)
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectNode, setPopoverState, clearSelection, Component])

  /**
   * Apply style overrides to matching elements in the preview
   * This effect runs whenever style overrides or the component changes
   */
  useEffect(() => {
    const previewContent = previewRef.current?.querySelector('.preview-content')
    if (!previewContent) return

    // Apply overrides to all elements with matching node IDs
    Object.entries(styleOverrides).forEach(([nodeId, styles]) => {
      const elements = previewContent.querySelectorAll('*')

      elements.forEach((element) => {
        const el = element as HTMLElement
        const elNodeId = generateNodeId(el)

        if (elNodeId === nodeId) {
          // Apply each style property to the element
          Object.entries(styles).forEach(([property, value]) => {
            if (value) {
              // Map style property names to CSS property names
              const cssPropertyMap: Record<string, string> = {
                background: 'backgroundColor',
                padding: 'padding',
                margin: 'margin',
                fontSize: 'fontSize',
                fontFamily: 'fontFamily',
                fontWeight: 'fontWeight',
              }

              const cssProperty = cssPropertyMap[property] || property
              el.style[cssProperty as any] = value
            }
          })
        }
      })
    })
  }, [styleOverrides, Component])

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
      <style>
        {`
          /* Isolate preview content from parent styles */
          .preview-content {
            all: initial;
            display: block;
            position: relative;
            box-sizing: border-box;
          }

          /* Ensure child elements don't inherit unwanted styles */
          .preview-content * {
            all: revert;
            box-sizing: border-box;
          }

          /* Reset common inherited properties */
          .preview-content {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: initial;
            background: transparent;
          }
        `}
      </style>
      <div className="h-full w-full overflow-auto relative" ref={previewRef}>
        <PreviewHint />
        <div className="preview-content">
          <ErrorBoundary key={key}>
            <Component />
          </ErrorBoundary>
        </div>
      </div>
      <StyleEditor />
    </>
  )
}
