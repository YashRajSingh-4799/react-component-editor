import Link from "next/link"
import { Code2, Play, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Navbar() {
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
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </div>
    </nav>
  )
}