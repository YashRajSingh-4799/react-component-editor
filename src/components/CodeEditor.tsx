"use client"

import { useRef } from "react"
import Editor, { Monaco } from "@monaco-editor/react"
import { useEditorStore } from "@/store/editor-store"

export function CodeEditor() {
  const code = useEditorStore((state) => state.code)
  const setCode = useEditorStore((state) => state.setCode)
  const editorRef = useRef<any>(null)

  function handleEditorDidMount(editor: any, monaco: Monaco) {
    editorRef.current = editor

    // Configure TypeScript to support JSX
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

    // Add React type definitions
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
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
      `,
      'file:///node_modules/@types/react/index.d.ts'
    )

    // Disable semantic validation to avoid React type errors
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })
  }

  function handleEditorChange(value: string | undefined) {
    if (value !== undefined) {
      setCode(value)
    }
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="typescript"
        defaultPath="component.tsx"
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
        }}
      />
    </div>
  )
}
