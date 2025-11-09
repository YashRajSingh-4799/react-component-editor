"use client"

import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { COMPILATION_TIMEOUT } from '@/constants/editor'

/**
 * CodeSynchronizer Component
 * Synchronizes style overrides from the visual editor back to the code editor
 * Monitors style changes and updates the JSX code with inline style attributes
 */
export function CodeSynchronizer() {
  const code = useEditorStore((state) => state.code)
  const styleOverrides = useEditorStore((state) => state.styleOverrides)
  const setCode = useEditorStore((state) => state.setCode)
  const selectedNode = useEditorStore((state) => state.selectedNode)

  // Refs to prevent infinite loops and redundant updates
  const isSyncingRef = useRef(false)
  const lastOverridesRef = useRef<string>('')

  /**
   * Synchronize style overrides to the code editor
   * This updates the JSX code with inline style attributes
   */
  useEffect(() => {
    // Skip if no overrides, no selected node, or already syncing
    if (!selectedNode || Object.keys(styleOverrides).length === 0 || isSyncingRef.current) {
      return
    }

    // Check if overrides actually changed to avoid redundant updates
    const currentOverridesStr = JSON.stringify(styleOverrides)
    if (currentOverridesStr === lastOverridesRef.current) {
      return
    }
    lastOverridesRef.current = currentOverridesStr

    try {
      isSyncingRef.current = true

      // Get the actual DOM element and compute its path
      const element = selectedNode.element
      const nodeId = selectedNode.nodeId
      const overrides = styleOverrides[nodeId]

      if (!overrides) return

      // Find the element in the code by its tag name and context
      const tagName = element.tagName.toLowerCase()

      // Create a regex to match the opening tag
      // This matches: <tagName ...> or <tagName ... />
      const tagRegex = new RegExp(`(<${tagName})((?:\\s+[^>]*?)?)(/?>)`, 'gi')

      let updatedCode = code
      let match
      let matchIndex = 0
      const targetPath = nodeId.split('>')
      const targetIndex = parseInt(targetPath[targetPath.length - 1]?.match(/\[(\d+)\]/)?.[1] || '0')

      // Reset regex
      tagRegex.lastIndex = 0

      while ((match = tagRegex.exec(code)) !== null) {
        if (matchIndex === targetIndex) {
          const fullMatch = match[0]
          const openTag = match[1]
          const attributes = match[2] || ''
          const closeTag = match[3]

          // Parse existing styles if they exist
          const existingStyleMatch = attributes.match(/style\s*=\s*\{\{([^}]*)\}\}/)
          const existingStyles: Record<string, string> = {}

          if (existingStyleMatch) {
            // Extract existing style properties
            const styleContent = existingStyleMatch[1]
            // Match key: "value" or key: 'value' pairs
            const styleProps = styleContent.match(/(\w+)\s*:\s*["']([^"']*)["']/g)

            if (styleProps) {
              styleProps.forEach((prop) => {
                const [key, value] = prop.split(':').map(s => s.trim())
                existingStyles[key] = value.replace(/["']/g, '')
              })
            }
          }

          // Merge existing styles with overrides (overrides take precedence)
          const mergedStyles: Record<string, string> = { ...existingStyles }

          Object.entries(overrides).forEach(([key, value]) => {
            if (value && value.trim() !== '') {
              // Map property names to React camelCase
              const reactProp = key === 'background' ? 'backgroundColor' : key
              mergedStyles[reactProp] = value
            }
          })

          // Build the complete style string
          const styleEntries = Object.entries(mergedStyles)
            .map(([key, value]) => `${key}: "${value}"`)

          if (styleEntries.length === 0) {
            // If no styles left, remove the style attribute
            const newAttributes = attributes.replace(/\s*style\s*=\s*\{\{[^}]*\}\}/, '')
            updatedCode = code.substring(0, match.index) + openTag + newAttributes + closeTag + code.substring(match.index + fullMatch.length)
          } else {
            const styleString = `style={{ ${styleEntries.join(', ')} }}`

            let newTag
            if (existingStyleMatch) {
              // Replace existing style attribute
              newTag = `${openTag}${attributes.replace(
                /style\s*=\s*\{\{[^}]*\}\}/,
                styleString
              )}${closeTag}`
            } else {
              // Add new style attribute
              newTag = `${openTag}${attributes} ${styleString}${closeTag}`
            }

            updatedCode = code.substring(0, match.index) + newTag + code.substring(match.index + fullMatch.length)
          }
          break
        }
        matchIndex++
      }

      if (updatedCode !== code) {
        setCode(updatedCode)
      }
    } catch (error) {
      console.error('Error synchronizing code:', error)
    } finally {
      // Use a small delay to reset the syncing flag to prevent race conditions
      setTimeout(() => {
        isSyncingRef.current = false
      }, COMPILATION_TIMEOUT)
    }
  }, [styleOverrides, selectedNode, code, setCode])

  return null
}
