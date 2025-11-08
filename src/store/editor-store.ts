import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { EditorState, SelectedNode, EditableStyles } from '@/types/editor';

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      // Code state
      code: `import React from 'react';

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
}`,
      setCode: (code) => set({ code }),

      // Style overrides
      styleOverrides: {},
      updateStyleOverride: (nodeId, property, value) =>
        set((state) => ({
          styleOverrides: {
            ...state.styleOverrides,
            [nodeId]: {
              ...state.styleOverrides[nodeId],
              [property]: value,
            },
          },
        })),
      clearStyleOverrides: () => set({ styleOverrides: {} }),

      // Component compilation
      CompiledComponent: null,
      setCompiledComponent: (component) => set({ CompiledComponent: component }),

      // Selection state
      selectedNode: null,
      selectNode: (nodeData) => set({ selectedNode: nodeData }),
      clearSelection: () =>
        set({ selectedNode: null, isPopoverOpen: false, popoverPosition: null }),

      // Popover state
      isPopoverOpen: false,
      popoverPosition: null,
      setPopoverState: (open, position = null) =>
        set({
          isPopoverOpen: open,
          popoverPosition: position,
        }),
    }),
    {
      name: 'editor-store',
    }
  )
);

// Selectors for better performance
export const useCode = () => useEditorStore((state) => state.code);
export const useStyleOverrides = () => useEditorStore((state) => state.styleOverrides);
export const useSelectedNode = () => useEditorStore((state) => state.selectedNode);
export const usePopoverState = () => useEditorStore((state) => ({
  isOpen: state.isPopoverOpen,
  position: state.popoverPosition,
}));