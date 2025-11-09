/**
 * Editor Configuration Constants
 * Centralized configuration values for the component editor
 */

// Monaco Editor Configuration
export const MONACO_EDITOR_CONFIG = {
  DEFAULT_LANGUAGE: 'typescript',
  DEFAULT_PATH: 'component.tsx',
  THEME: 'vs-dark',
  FONT_SIZE: 14,
  TAB_SIZE: 2,
} as const

export const MONACO_EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: MONACO_EDITOR_CONFIG.FONT_SIZE,
  lineNumbers: 'on' as const,
  roundedSelection: false,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: MONACO_EDITOR_CONFIG.TAB_SIZE,
  wordWrap: 'on' as const,
}

// Component Compilation
export const COMPILATION_TIMEOUT = 100 // milliseconds

// Preview Panel
export const PREVIEW_PADDING = 16 // pixels

// Style Editor Popover
export const POPOVER_OFFSET_Y = 10 // pixels below element
export const POPOVER_WIDTH = 320 // pixels
export const POPOVER_Z_INDEX = 9999

// Selection Hotkeys
export const SELECTION_MODIFIER_KEY = 'Alt' // or 'Option' on Mac
export const CANCEL_SELECTION_KEY = 'Escape'

// Resizable Panels
export const PANEL_DEFAULT_SIZE = 50 // percentage
export const PANEL_MIN_SIZE = 30 // percentage

// Toast Duration
export const TOAST_DURATION = 5000 // milliseconds

// Default Component Template
export const DEFAULT_COMPONENT_CODE = `import React from 'react';

export default function Component() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Hello World</h1>
      <p style={{ color: '#666' }}>This is a sample component that you can edit!</p>
      <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
        <span style={{ color: '#1e40af' }}>Click on any element to start editing its styles.</span>
      </div>
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <button style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Primary Button
        </button>
        <button>
          Secondary Button
        </button>
      </div>
    </div>
  );
}`

// CSS Class Names
export const CSS_CLASSES = {
  PREVIEW_CONTENT: 'preview-content',
  STYLE_EDITOR_POPOVER: 'style-editor-popover',
} as const

// Style Property Mappings
export const CSS_PROPERTY_MAP: Record<string, string> = {
  background: 'backgroundColor',
  padding: 'padding',
  margin: 'margin',
  fontSize: 'fontSize',
  fontFamily: 'fontFamily',
  fontWeight: 'fontWeight',
}

// Babel Configuration
export const BABEL_PRESETS: ['react', 'typescript'] = ['react', 'typescript']
export const BABEL_FILENAME = 'component.tsx'
