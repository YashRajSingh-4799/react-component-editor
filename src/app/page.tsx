"use client"

import { Navbar } from "@/components/Navbar";
import { CodeEditor } from "@/components/CodeEditor";
import { Preview } from "@/components/Preview";
import { DevTools } from "@/components/DevTools";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <DevTools />
      <Navbar />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full">
            <CodeEditor />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full p-4">
            <Preview />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}