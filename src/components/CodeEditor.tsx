"use client"

import { useRef, useCallback } from "react"
import Editor, { Monaco, OnMount } from "@monaco-editor/react"
import { useEditorStore } from "@/store/editor-store"
import {
  MONACO_EDITOR_CONFIG,
  MONACO_EDITOR_OPTIONS,
} from "@/constants/editor"

/**
 * React type definitions for Monaco Editor
 * Minimal type definitions to enable React syntax highlighting and autocomplete
 */
const REACT_TYPE_DEFINITIONS = `
  declare module 'react' {
    export = React;
    export as namespace React;
    namespace React {
      type ReactNode = string | number | boolean | null | undefined | ReactElement | ReactFragment;
      type ReactElement = any;
      type ReactFragment = any;
      type FC<P = {}> = (props: P) => ReactElement | null;
      type ComponentType<P = {}> = FC<P>;
      function createElement(type: any, props?: any, ...children: any[]): ReactElement;
      const Fragment: any;
      function useState<S>(initialState: S | (() => S)): [S, (newState: S) => void];
      function useEffect(effect: () => void | (() => void), deps?: any[]): void;
      function useRef<T>(initialValue: T): { current: T };
      function useMemo<T>(factory: () => T, deps: any[]): T;
      function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
    }
  }
`

/**
 * Configure Monaco Editor TypeScript compiler options
 */
function configureTypeScriptDefaults(monaco: Monaco): void {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    jsx: monaco.languages.typescript.JsxEmit.React,
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    noEmit: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    allowJs: true,
    skipLibCheck: true,
  })

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  })
}

/**
 * Add React type definitions to Monaco
 */
function addReactTypes(monaco: Monaco): void {
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    REACT_TYPE_DEFINITIONS,
    'file:///node_modules/@types/react/index.d.ts'
  )
}

/**
 * CodeEditor Component
 * Monaco-based code editor with TypeScript and JSX support
 */
export function CodeEditor() {
  const code = useEditorStore((state) => state.code)
  const setCode = useEditorStore((state) => state.setCode)
  const editorRef = useRef<any>(null)

  /**
   * Handle editor mount event
   * Configure TypeScript and React type definitions
   */
  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor
    configureTypeScriptDefaults(monaco)
    addReactTypes(monaco)
  }, [])

  /**
   * Handle code changes in the editor
   */
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        setCode(value)
      }
    },
    [setCode]
  )

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage={MONACO_EDITOR_CONFIG.DEFAULT_LANGUAGE}
        defaultPath={MONACO_EDITOR_CONFIG.DEFAULT_PATH}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={MONACO_EDITOR_CONFIG.THEME}
        options={MONACO_EDITOR_OPTIONS}
      />
    </div>
  )
}
