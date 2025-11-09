"use client"

import { useCallback } from "react"
import Link from "next/link"
import { Code2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useEditorStore } from "@/store/editor-store"
import { TOAST_DURATION } from "@/constants/editor"

/**
 * Navbar Component
 * Application header with branding and copy-to-clipboard functionality
 */
export function Navbar() {
  const { toast } = useToast()
  const code = useEditorStore((state) => state.code)

  /**
   * Copy code to clipboard and show success toast
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      toast({
        title: "Code copied!",
        description: "The code has been copied to your clipboard.",
        duration: TOAST_DURATION,
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
        duration: TOAST_DURATION,
      })
    }
  }, [code, toast])

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold">React Component Editor</h1>
              <p className="text-xs text-muted-foreground">Runable assignment</p>
            </div>
          </Link>
        </div>

        <div className="ml-auto flex items-center">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Code
          </Button>
        </div>
      </div>
    </nav>
  )
}