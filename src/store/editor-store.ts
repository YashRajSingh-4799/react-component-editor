import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { EditorState, SelectedNode, EditableStyles } from '@/types/editor';

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      // Code state
      code: `export default function Component() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Hello World</h1>
      <p className="text-gray-600">This is a sample component that you can edit!</p>
      <div className="mt-4 p-4 bg-blue-100 rounded">
        <span className="text-blue-800">Click on any element to start editing its styles.</span>
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