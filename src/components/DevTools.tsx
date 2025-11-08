"use client"

import { useEffect } from 'react'
import { mountStoreDevtool } from 'simple-zustand-devtools'
import { useEditorStore } from '@/store/editor-store'

/**
 * DevTools component that makes Zustand store visible in React DevTools
 * Uses simple-zustand-devtools to mount the store in React DevTools Components tab
 */
export function DevTools() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      mountStoreDevtool('EDITOR_STORE', useEditorStore)
    }
  }, [])

  // This component renders nothing but mounts devtools
  return null
}
