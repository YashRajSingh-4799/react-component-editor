Technical Design Document (TDD)

  React Component Visual Editor
  Version: 1.0 | Date: November 8, 2025 | Author: Frontend Engineering Team

  1. Executive Summary

  Build a web-based visual editor that allows users to paste React component code, preview it live, and edit CSS
  properties (padding, margin, background, font) by clicking elements directly in the preview. Changes made visually
  are automatically reflected back in the source code.

  2. Problem Statement

  Developers often need to quickly prototype and adjust styling of React components. Current workflow requires:
  - Manual code editing
  - Context switching between code and preview
  - Trial-and-error for visual adjustments

  Goal: Create an intuitive visual editor that maintains code as source of truth while enabling direct manipulation of
   rendered components.

  3. Key Requirements

  3.1 Functional Requirements

  - FR-1: User can paste/type React JSX code into a code editor (P0)
  - FR-2: Code is rendered as a live preview in real-time (P0)
  - FR-3: User can click any element in the preview to select it (P0)
  - FR-4: Selected element shows a popover with editable style properties (P0)
  - FR-5: Support editing: padding, margin, background, fontSize, fontFamily, fontWeight (6 properties only) (P0)
  - FR-6: Changes in popover update the source code immediately (P0)
  - FR-7: Changes in code editor update the preview immediately (P0)
  - FR-8: Original CSS (classes, Tailwind, styled-components) is preserved (P1)
  - FR-9: Modifications are applied as inline styles (P0)
  - FR-10: User can export/save the modified component code (P1)

  3.2 Performance Targets

  - Preview updates within 500ms of code change
  - Visual edits reflect in preview within 100ms
  - Style override latency < 50ms
  - Error rate < 2% of operations

  4. Core Technical Strategy

  4.1 Dual-State Architecture

  Approach: Maintain original code untouched during editing while storing style modifications separately. Apply
  changes as inline style overrides only.

  Benefits:
  - Non-destructive editing (original code preserved)
  - Inline styles have highest CSS specificity (always override)
  - Simple modification path (no AST manipulation during editing)
  - Universal CSS compatibility (classes, Tailwind, styled-components, external)
  - Safer implementation (reduced code execution risks)

  4.2 Data Flow

  Code → Preview Flow:
  1. User types in Monaco Editor
  2. Code string stored in React state
  3. Babel transforms JSX → adds data-node-id to each element
  4. Transformed code compiled to React component
  5. Component rendered in Preview Panel

  Visual Edit → Code Flow:
  1. User clicks element in preview
  2. Extract data-node-id from clicked element
  3. Read computed styles using getComputedStyle()
  4. Show popover with current values
  5. User edits property in popover
  6. Update style override map: { nodeId: { property: value } }
  7. Re-render preview with style overrides applied
  8. Debounced code update: generate final code only for Monaco sync
  9. Export: merge overrides into inline styles in source code

  5. Data Structures

  5.1 Application State (Zustand Store)

  interface EditorState {
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
    selectedNode: {
      nodeId: string;
      element: HTMLElement;
      computedStyles: ComputedStyles;
    } | null;
    selectNode: (nodeData: EditorState['selectedNode']) => void;
    clearSelection: () => void;

    // Popover state
    isPopoverOpen: boolean;
    popoverPosition: { x: number; y: number } | null;
    setPopoverState: (open: boolean, position?: { x: number; y: number }) => void;
  }

  interface EditableStyles {
    padding?: string;
    margin?: string;
    background?: string;
    fontSize?: string;
    fontFamily?: string;
    fontWeight?: string;
  }

  5.2 Style Override Structure

  // Style override map - separate from code
  const styleOverrides = {
    'node-1': {
      padding: '20px',
      margin: '16px',
      background: '#f0f0f0'
    },
    'node-2': {
      fontSize: '18px',
      fontWeight: 'bold'
    }
  };

  // Applied at render time via component wrapper
  <div 
    data-node-id="node-1" 
    className="existing-classes"
    style={{
      ...existingInlineStyles,
      ...styleOverrides['node-1'] // Override applied
    }}
  >
    Content
  </div>

  6. Core Algorithms

  6.1 Zustand Store Implementation

  // store/editor-store.ts
  import { create } from 'zustand';
  import { devtools } from 'zustand/middleware';

  export const useEditorStore = create<EditorState>()(devtools((set, get) => ({
    // Code state
    code: '',
    setCode: (code) => set({ code }),

    // Style overrides
    styleOverrides: {},
    updateStyleOverride: (nodeId, property, value) => set((state) => ({
      styleOverrides: {
        ...state.styleOverrides,
        [nodeId]: {
          ...state.styleOverrides[nodeId],
          [property]: value
        }
      }
    })),
    clearStyleOverrides: () => set({ styleOverrides: {} }),

    // Component compilation
    CompiledComponent: null,
    setCompiledComponent: (component) => set({ CompiledComponent: component }),

    // Selection state
    selectedNode: null,
    selectNode: (nodeData) => set({ selectedNode: nodeData }),
    clearSelection: () => set({ selectedNode: null, isPopoverOpen: false }),

    // Popover state
    isPopoverOpen: false,
    popoverPosition: null,
    setPopoverState: (open, position) => set({ 
      isPopoverOpen: open, 
      popoverPosition: position || null 
    })
  })));

  // Component wrapper that applies overrides
  function StyledWrapper({ nodeId, children, ...props }) {
    const styleOverrides = useEditorStore(state => state.styleOverrides);
    const overrides = styleOverrides[nodeId] || {};

    return React.cloneElement(children, {
      ...props,
      style: {
        ...props.style, // Preserve existing inline styles
        ...overrides    // Apply user modifications
      }
    });
  }

  6.2 Style Extraction (6 Properties Only)

  function extractEditableStyles(element) {
    const computed = window.getComputedStyle(element);

    // Only extract the 6 supported properties
    return {
      padding: computed.padding,
      margin: computed.margin,
      background: computed.backgroundColor,
      fontSize: computed.fontSize,
      fontFamily: computed.fontFamily,
      fontWeight: computed.fontWeight
    };
  }

  6.3 Export-Time Code Generation

  // Used only for final export, not during editing
  function generateFinalCode(originalCode, styleOverrides) {
    if (Object.keys(styleOverrides).length === 0) {
      return originalCode; // No changes, return original
    }

    const ast = parser.parse(originalCode, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    traverse(ast, {
      JSXElement(path) {
        const nodeIdAttr = path.node.openingElement.attributes.find(
          attr => attr.name?.name === 'data-node-id'
        );

        if (nodeIdAttr) {
          const nodeId = nodeIdAttr.value.value;
          const overrides = styleOverrides[nodeId];

          if (overrides) {
            addInlineStyles(path.node, overrides);
          }
        }
      }
    });

    return generate(ast, { retainLines: true }).code;
  }

  7. Technology Stack

  7.1 Framework & Core Dependencies

  {
    "dependencies": {
      "next": "^14.0.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      
      // State Management
      "zustand": "^4.4.0",
      
      // Code Editor
      "@monaco-editor/react": "^4.6.0",
      
      // AST Manipulation
      "@babel/standalone": "^7.23.0",
      "@babel/parser": "^7.23.0",
      "@babel/traverse": "^7.23.0",
      "@babel/generator": "^7.23.0",
      
      // UI Components (ShadCN)
      "@radix-ui/react-popover": "^1.0.7",
      "@radix-ui/react-slider": "^1.1.2",
      "@radix-ui/react-select": "^2.0.0",
      "@radix-ui/react-separator": "^1.0.3",
      "class-variance-authority": "^0.7.0",
      "clsx": "^2.0.0",
      "tailwindcss-animate": "^1.0.7",
      "lucide-react": "^0.294.0",
      
      // Positioning
      "@floating-ui/react": "^0.26.0",
      
      // Utilities
      "lodash.debounce": "^4.0.8"
    },
    "devDependencies": {
      "@types/node": "^20",
      "@types/react": "^18",
      "@types/react-dom": "^18",
      "typescript": "^5",
      "tailwindcss": "^3.3.0",
      "postcss": "^8",
      "autoprefixer": "^10"
    }
  }

  7.2 Key Technical Decisions

  | Decision         | Choice                      | Rationale                                      |
  |------------------|-----------------------------|------------------------------------------------|
  | Framework        | Next.js 14                  | React framework, SSR/SSG, optimized bundling   |
  | State Management | Zustand                     | Lightweight, TypeScript-first, no boilerplate  |
  | UI Components    | ShadCN + Radix UI          | Accessible, customizable, Tailwind integration |
  | Styling          | Tailwind CSS               | Utility-first, fast development, small bundle  |
  | Code Editor      | Monaco Editor               | Industry standard, VS Code engine, JSX support |
  | JSX Transform    | Babel Standalone            | Client-side transform, node-id injection only  |
  | Style Management | Dual-state system           | Non-destructive, safer, better performance     |
  | Popover UI       | Floating UI + ShadCN        | Modern, accessible, flexible positioning       |
  | CSS Modification | Inline style overrides      | Highest specificity, preserves original CSS    |
  | Property Support | 6 essential properties only | Simplified UI, focused user experience         |

  8. Implementation Plan

  Phase 1: Next.js Foundation (Week 1)

  - Set up Next.js 14 project with TypeScript
  - Configure Tailwind CSS and ShadCN components
  - Set up Zustand store with devtools
  - Integrate Monaco Editor with Next.js
  - Implement basic code → preview pipeline
  - Add Babel transformation with node-id injection

  Phase 2: ShadCN UI & Selection (Week 2)

  - Build style popover with ShadCN components (Popover, Input, Select, Slider)
  - Implement element click detection and highlighting
  - Extract computed styles (6 properties only)
  - Create property input components (ColorPicker, SpacingInput, FontControls)
  - Connect popover to Zustand store

  Phase 3: Style Override System (Week 3)

  - Implement style override state management
  - Connect popover inputs to override updates
  - Add component wrapper system for style application
  - Handle edge cases and style precedence

  Phase 4: Export & Polish (Week 4)

  - Implement export-time code generation
  - Add comprehensive error handling
  - Implement save/export functionality
  - Performance optimization and testing

  9. Security & Performance

  9.1 Security (Improved)

  - Dual-state system reduces direct code execution
  - Style modifications don't trigger code re-compilation
  - Babel used only for node-id injection (minimal AST changes)
  - Export-time code generation only when needed

  9.2 Performance Optimizations

  - Code → Preview: Debounce editor changes (500ms) → < 500ms update
  - Style Changes: Direct state updates (no AST parsing) → < 100ms update
  - Style Overrides: Shallow object merging
  - Initial Load: Lazy load Monaco + Babel → Faster startup

  9.3 Bundle Size (Next.js Optimized)

  - Next.js core: ~80 KB (gzipped)
  - Monaco Editor: ~2.5 MB (code-split, lazy load)
  - Babel Standalone: ~1.8 MB (reduced usage, lazy load)
  - ShadCN + Radix UI: ~100 KB (tree-shaken)
  - Zustand: ~8 KB (minimal overhead)
  - Core app: ~120 KB (smaller due to simplified logic)
  - Total initial: ~200 KB (heavy deps lazy loaded, Next.js optimizations)

  10. Success Metrics

  - Code → Preview latency: < 500ms
  - Visual Edit → Preview latency: < 100ms (improved)
  - Style Override latency: < 50ms
  - Error rate: < 2% of operations (improved)
  - User satisfaction: > 4/5 rating
  - Browser compatibility: 95%+ users

  11. Next.js Project Structure

  ```
  react-component-editor/
  ├── app/
  │   ├── globals.css
  │   ├── layout.tsx
  │   └── page.tsx                    # Main editor page
  ├── components/
  │   ├── ui/                         # ShadCN components
  │   │   ├── button.tsx
  │   │   ├── input.tsx
  │   │   ├── popover.tsx
  │   │   ├── select.tsx
  │   │   └── slider.tsx
  │   ├── editor/
  │   │   ├── code-editor.tsx         # Monaco Editor wrapper
  │   │   ├── preview-panel.tsx       # Live preview
  │   │   ├── style-popover.tsx       # Property editor
  │   │   └── styled-wrapper.tsx      # Style override wrapper
  │   └── property-inputs/
  │       ├── color-picker.tsx
  │       ├── spacing-input.tsx
  │       └── font-controls.tsx
  ├── store/
  │   └── editor-store.ts             # Zustand store
  ├── lib/
  │   ├── utils.ts                    # Utility functions
  │   ├── ast-utils.ts               # Babel/AST helpers
  │   └── style-utils.ts             # Style extraction/generation
  └── types/
      └── editor.ts                   # TypeScript definitions
  ```

  12. ShadCN Component Integration

  12.1 Style Popover Implementation

  ```tsx
  // components/editor/style-popover.tsx
  import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
  import { Label } from "@/components/ui/label";
  import { Input } from "@/components/ui/input";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { Separator } from "@/components/ui/separator";
  import { useEditorStore } from "@/store/editor-store";

  export function StylePopover() {
    const { selectedNode, updateStyleOverride, isPopoverOpen, setPopoverState } = useEditorStore();

    if (!selectedNode) return null;

    return (
      <Popover open={isPopoverOpen} onOpenChange={setPopoverState}>
        <PopoverContent className="w-80 p-4" side="right" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="padding">Padding</Label>
              <Input
                id="padding"
                placeholder="16px"
                onChange={(e) => updateStyleOverride(selectedNode.nodeId, 'padding', e.target.value)}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="font-family">Font Family</Label>
              <Select onValueChange={(value) => updateStyleOverride(selectedNode.nodeId, 'fontFamily', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system-ui">System UI</SelectItem>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
  ```

  12.2 Property Input Components

  ```tsx
  // components/property-inputs/spacing-input.tsx
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";

  interface SpacingInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }

  export function SpacingInput({ label, value, onChange }: SpacingInputProps) {
    const presets = ['0', '4px', '8px', '16px', '24px', '32px'];

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex space-x-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="16px"
            className="flex-1"
          />
          <div className="flex space-x-1">
            {presets.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => onChange(preset)}
                className="px-2 text-xs"
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  ```

  This streamlined TDD focuses on the essential functionality with a much safer, simpler, and more performant
  architecture using modern Next.js, Zustand, and ShadCN components.