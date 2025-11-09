"use client"

import { useState, useEffect } from "react"
import { Mouse } from "lucide-react"

export function PreviewHint() {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0)
  }, [])

  return (
      <div className="absolute bottom-4 right-4 z-40 pointer-events-none animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-300">
        <div className="bg-slate-100/90 backdrop-blur-sm border border-slate-300 rounded-md px-3 py-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-slate-300 rounded shadow-sm">
              {isMac ? "⌥" : "Alt"}
              </kbd>
              <span className="text-slate-500">+</span>
              <Mouse className="h-3 w-3" />
              <span className="font-medium">to edit</span>
            </div>
          </div>
        </div>
  )
}
