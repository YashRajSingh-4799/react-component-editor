export interface EditableStyles {
  padding?: string
  margin?: string
  background?: string
  fontSize?: string
  fontFamily?: string
  fontWeight?: string
}

export interface ComputedStyles {
  padding: string
  margin: string
  backgroundColor: string
  fontSize: string
  fontFamily: string
  fontWeight: string
}

export interface SelectedNode {
  nodeId: string
  element: HTMLElement
  computedStyles: ComputedStyles
}

export interface PopoverPosition {
  x: number
  y: number
}

export interface EditorState {
  // Source code management
  code: string
  setCode: (code: string) => void

  // Style override management
  styleOverrides: Record<string, Partial<EditableStyles>>
  updateStyleOverride: (nodeId: string, property: string, value: string) => void
  clearStyleOverrides: () => void

  // Component compilation
  CompiledComponent: React.ComponentType | null
  setCompiledComponent: (component: React.ComponentType | null) => void

  // Node selection
  selectedNode: SelectedNode | null
  selectNode: (nodeData: SelectedNode | null) => void
  clearSelection: () => void

  // Popover management
  isPopoverOpen: boolean
  popoverPosition: PopoverPosition | null
  setPopoverState: (open: boolean, position?: PopoverPosition | null) => void
}

export enum ErrorType {
  PARSE_ERROR = 'Syntax error in JSX',
  COMPILE_ERROR = 'Unable to compile component',
  RUNTIME_ERROR = 'Component crashed during render',
  AST_ERROR = 'Unable to modify code structure',
}

export interface EditorError {
  type: ErrorType
  message: string
  line?: number
  column?: number
}

export type StyleProperty = keyof EditableStyles

export function isStyleProperty(prop: string): prop is StyleProperty {
  return ['padding', 'margin', 'background', 'fontSize', 'fontFamily', 'fontWeight'].includes(prop)
}