export interface EditableStyles {
  padding?: string;
  margin?: string;
  background?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
}

export interface ComputedStyles {
  padding: string;
  margin: string;
  backgroundColor: string;
  fontSize: string;
  fontFamily: string;
  fontWeight: string;
}

export interface SelectedNode {
  nodeId: string;
  element: HTMLElement;
  computedStyles: ComputedStyles;
}

export interface EditorState {
  // Source code string (original, unchanged during editing)
  code: string;
  setCode: (code: string) => void;

  // Style overrides (separate from code)
  styleOverrides: Record<string, Partial<EditableStyles>>;
  updateStyleOverride: (nodeId: string, property: string, value: string) => void;
  clearStyleOverrides: () => void;

  // Compiled component function
  CompiledComponent: React.ComponentType | null;
  setCompiledComponent: (component: React.ComponentType | null) => void;

  // Currently selected element
  selectedNode: SelectedNode | null;
  selectNode: (nodeData: SelectedNode | null) => void;
  clearSelection: () => void;

  // Popover state
  isPopoverOpen: boolean;
  popoverPosition: { x: number; y: number } | null;
  setPopoverState: (open: boolean, position?: { x: number; y: number } | null) => void;
}

export enum ErrorType {
  PARSE_ERROR = 'Syntax error in JSX',
  COMPILE_ERROR = 'Unable to compile component',
  RUNTIME_ERROR = 'Component crashed during render',
  AST_ERROR = 'Unable to modify code structure'
}

export interface EditorError {
  type: ErrorType;
  message: string;
  line?: number;
  column?: number;
}