import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { EditorState } from '@/types/editor'
import { DEFAULT_COMPONENT_CODE } from '@/constants/editor'

export const useEditorStore = create<EditorState>()(
  devtools(
    (set) => ({
      // Code state management
      code: DEFAULT_COMPONENT_CODE,
      setCode: (code) => set({ code }),

      // Style overrides management
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

      // Component compilation state
      CompiledComponent: null,
      setCompiledComponent: (component) => set({ CompiledComponent: component }),

      // Node selection state
      selectedNode: null,
      selectNode: (nodeData) => set({ selectedNode: nodeData }),
      clearSelection: () =>
        set({ selectedNode: null, isPopoverOpen: false, popoverPosition: null }),

      // Popover state management
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
)

/** Get the current code from the editor */
export const useCode = () => useEditorStore((state) => state.code)

/** Get all style overrides */
export const useStyleOverrides = () => useEditorStore((state) => state.styleOverrides)

/** Get the currently selected node */
export const useSelectedNode = () => useEditorStore((state) => state.selectedNode)

/** Get the popover open state and position */
export const usePopoverState = () =>
  useEditorStore((state) => ({
    isOpen: state.isPopoverOpen,
    position: state.popoverPosition,
  }))