"use client"

import { useCallback, useMemo, type ChangeEvent } from "react"
import { X } from "lucide-react"
import { useEditorStore } from "@/store/editor-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { POPOVER_Z_INDEX, CSS_CLASSES } from "@/constants/editor"
import type { EditableStyles } from "@/types/editor"

/**
 * Style field configuration
 */
interface StyleField {
  id: keyof EditableStyles
  label: string
  placeholder: string
}

const STYLE_FIELDS: StyleField[] = [
  { id: 'padding', label: 'Padding', placeholder: 'e.g., 16px' },
  { id: 'margin', label: 'Margin', placeholder: 'e.g., 8px 16px' },
  { id: 'background', label: 'Background', placeholder: 'e.g., #ffffff' },
  { id: 'fontSize', label: 'Font Size', placeholder: 'e.g., 14px' },
  { id: 'fontWeight', label: 'Font Weight', placeholder: 'e.g., bold' },
  { id: 'fontFamily', label: 'Font Family', placeholder: 'e.g., Arial' },
]

/**
 * StyleEditor Component
 * Floating popover editor for modifying element styles
 */
export function StyleEditor() {
  const selectedNode = useEditorStore((state) => state.selectedNode)
  const isPopoverOpen = useEditorStore((state) => state.isPopoverOpen)
  const popoverPosition = useEditorStore((state) => state.popoverPosition)
  const styleOverrides = useEditorStore((state) => state.styleOverrides)
  const updateStyleOverride = useEditorStore((state) => state.updateStyleOverride)
  const clearSelection = useEditorStore((state) => state.clearSelection)

  /**
   * Get current style values for the selected element
   */
  const currentStyles = useMemo(() => {
    if (!selectedNode) return {}

    const currentOverrides = styleOverrides[selectedNode.nodeId] || {}
    const element = selectedNode.element

    return {
      padding: element.style.padding || currentOverrides.padding || '',
      margin: element.style.margin || currentOverrides.margin || '',
      background: element.style.backgroundColor || currentOverrides.background || '',
      fontSize: element.style.fontSize || currentOverrides.fontSize || '',
      fontWeight: element.style.fontWeight || currentOverrides.fontWeight || '',
      fontFamily: element.style.fontFamily || currentOverrides.fontFamily || '',
    }
  }, [selectedNode, styleOverrides])

  /**
   * Handle style property change
   */
  const handleStyleChange = useCallback(
    (property: keyof EditableStyles) => (e: ChangeEvent<HTMLInputElement>) => {
      if (selectedNode) {
        updateStyleOverride(selectedNode.nodeId, property, e.target.value)
      }
    },
    [selectedNode, updateStyleOverride]
  )

  // Don't render if no node is selected
  if (!selectedNode || !isPopoverOpen || !popoverPosition) {
    return null
  }

  return (
    <div
      className={`${CSS_CLASSES.STYLE_EDITOR_POPOVER} fixed rounded-md border bg-white p-4 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200`}
      style={{
        left: `${popoverPosition.x}px`,
        top: `${popoverPosition.y}px`,
        transform: 'translateX(-50%)',
        zIndex: POPOVER_Z_INDEX,
        width: '320px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Edit Styles</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={clearSelection}
            aria-label="Close style editor"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Style Input Fields */}
        <div className="space-y-3">
          {STYLE_FIELDS.map((field) => (
            <div key={field.id} className="space-y-1">
              <Label htmlFor={field.id} className="text-xs">
                {field.label}
              </Label>
              <Input
                id={field.id}
                placeholder={field.placeholder}
                defaultValue={currentStyles[field.id]}
                onChange={handleStyleChange(field.id)}
                className="h-8 text-xs"
              />
            </div>
          ))}
        </div>

        {/* Node Info */}
        <div className="pt-2 text-xs text-muted-foreground border-t">
          <p className="font-mono text-[10px] truncate" title={selectedNode.nodeId}>
            Node: {selectedNode.nodeId}
          </p>
        </div>
      </div>
    </div>
  )
}
