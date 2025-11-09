"use client"

import { Navbar } from "@/components/Navbar"
import { CodeEditor } from "@/components/CodeEditor"
import { Preview } from "@/components/Preview"
import { DevTools } from "@/components/DevTools"
import { CodeSynchronizer } from "@/components/CodeSynchronizer"
import { Toaster } from "@/components/ui/toaster"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { PANEL_DEFAULT_SIZE, PANEL_MIN_SIZE } from "@/constants/editor"

/**
 * Home Page Component
 * Main application layout with split-panel editor and preview
 */
export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      {/* Global utilities */}
      <DevTools />
      <CodeSynchronizer />

      {/* Main layout */}
      <Navbar />

      {/* Split panel editor/preview */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Code Editor Panel */}
        <ResizablePanel
          defaultSize={PANEL_DEFAULT_SIZE}
          minSize={PANEL_MIN_SIZE}
        >
          <div className="h-full">
            <CodeEditor />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Preview Panel */}
        <ResizablePanel
          defaultSize={PANEL_DEFAULT_SIZE}
          minSize={PANEL_MIN_SIZE}
        >
          <div className="h-full p-4">
            <Preview />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}