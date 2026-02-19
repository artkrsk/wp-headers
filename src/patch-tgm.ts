/**
 * Patch the `version` field for a specific plugin slug inside a TGM-style PHP array.
 *
 * Handles both `array()` and `[]` syntax, aligned `=>` whitespace,
 * mixed quote styles, nested function calls, and arbitrary field order.
 *
 * Returns the patched content, or the original content unchanged if:
 * - The slug is not found
 * - No version field exists in the slug's array block
 * - The version already matches
 */
export function patchTgmVersion(
  content: string,
  slug: string,
  version: string,
): string {
  // A. Find slug via regex — handles mixed quotes + flexible whitespace
  const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const slugPattern = new RegExp(
    `['"]slug['"]\\s*=>\\s*['"]${escapedSlug}['"]`,
  )
  const slugMatch = slugPattern.exec(content)
  if (!slugMatch) {
    return content
  }

  const slugPos = slugMatch.index

  // B. Walk backwards with dual depth tracking to find enclosing array opener
  let parenDepth = 0
  let bracketDepth = 0
  let arrayStart = -1

  for (let i = slugPos - 1; i >= 0; i--) {
    const ch = content[i]
    if (ch === ')') {
      parenDepth++
    } else if (ch === '(') {
      if (parenDepth === 0) {
        // Check if preceded by "array"
        const before = content.slice(Math.max(0, i - 5), i)
        if (before === 'array') {
          arrayStart = i - 5
        } else {
          arrayStart = i
        }
        break
      }
      parenDepth--
    } else if (ch === ']') {
      bracketDepth++
    } else if (ch === '[') {
      if (bracketDepth === 0) {
        arrayStart = i
        break
      }
      bracketDepth--
    }
  }

  if (arrayStart === -1) {
    return content
  }

  // C. Walk forwards with depth tracking to find matching closer
  // Determine what kind of opener we have
  const openerChar = content[arrayStart] === '[' ? '[' : '('
  const closerChar = openerChar === '[' ? ']' : ')'
  // Find the actual opening bracket/paren position
  let openPos = arrayStart
  if (openerChar === '(') {
    openPos = content.indexOf('(', arrayStart)
    /* v8 ignore next 3 */
    if (openPos === -1) {
      return content
    }
  }

  let depth = 0
  let arrayEnd = -1

  for (let i = openPos; i < content.length; i++) {
    const ch = content[i]
    if (ch === openerChar) {
      depth++
    } else if (ch === closerChar) {
      depth--
      if (depth === 0) {
        arrayEnd = i
        break
      }
    }
  }

  if (arrayEnd === -1) {
    return content
  }

  // D. Replace version within the block
  const block = content.slice(arrayStart, arrayEnd + 1)
  const versionPattern = /(['"])version\1(\s*=>\s*)(['"])[^'"]*\3/
  const newBlock = block.replace(versionPattern, (_, q1, arrow, q3) => {
    return `${q1}version${q1}${arrow}${q3}${version}${q3}`
  })

  if (newBlock === block) {
    return content
  }

  return content.slice(0, arrayStart) + newBlock + content.slice(arrayEnd + 1)
}
