import { ComputedStyles } from '@/types/editor'
import { CSS_CLASSES } from '@/constants/editor'

export function generateNodeId(element: HTMLElement): string {
  const path: string[] = []
  let current: HTMLElement | null = element

  while (current && !current.classList.contains(CSS_CLASSES.PREVIEW_CONTENT)) {
    const parent: HTMLElement | null = current.parentElement

    if (parent) {
      const tagName = current.tagName.toLowerCase()

      // Count only siblings with the same tag name for accurate indexing
      const siblings = Array.from(parent.children).filter(
        (child: Element) => child.tagName.toLowerCase() === tagName
      )

      const index = siblings.indexOf(current)
      path.unshift(`${tagName}[${index}]`)
    }

    current = parent
  }

  return path.join('>')
}

export function findElementByNodeId(
  nodeId: string,
  root: HTMLElement
): HTMLElement | null {
  const parts = nodeId.split('>')
  let current: Element | null = root

  for (const part of parts) {
    if (!current) return null

    const match = part.match(/^(\w+)\[(\d+)\]$/)
    if (!match) return null

    const [, tagName, indexStr] = match
    const index = parseInt(indexStr, 10)

    const children: Element[] = Array.from(current.children).filter(
      (child: Element) => child.tagName.toLowerCase() === tagName
    )

    current = children[index] || null
  }

  return current as HTMLElement | null
}

export function getComputedStyles(element: HTMLElement): ComputedStyles {
  const computed = window.getComputedStyle(element)

  return {
    padding: computed.padding,
    margin: computed.margin,
    backgroundColor: computed.backgroundColor,
    fontSize: computed.fontSize,
    fontFamily: computed.fontFamily,
    fontWeight: computed.fontWeight,
  }
}

export function applyStyleOverrides(
  element: HTMLElement,
  overrides: Record<string, string>
): void {
  Object.entries(overrides).forEach(([property, value]) => {
    const cssProperty = toKebabCase(property)
    element.style.setProperty(cssProperty, value)
  })
}

export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

export function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}
