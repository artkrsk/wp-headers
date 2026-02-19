import type { ThemeHeaderFields } from './theme-header.js'
import type { PluginHeaderFields } from './plugin-header.js'

export interface ReadmeHeaderOptions {
  /** package.json-style object with `name`, `version`, and `wp.theme` or `wp.plugin` */
  pkg: Record<string, unknown>
  /** Entity directory slug */
  slug: string
  /** Whether this is a theme or plugin readme */
  type: 'theme' | 'plugin'
}

function titleCase(str: string): string {
  return str
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function deriveName(pkg: Record<string, unknown>, slug: string, type: 'theme' | 'plugin'): string {
  const name = (pkg['name'] as string | undefined) ?? ''
  const suffix = type === 'theme' ? '-theme' : '-plugin'
  return titleCase(name.replace(/^@[\w-]+\//, '').replace(new RegExp(`${suffix}$`), '')) || titleCase(slug)
}

/**
 * Build a WordPress readme.txt header block.
 *
 * Generates the `=== Name ===` title line followed by key: value fields.
 * Field order follows WordPress.org conventions.
 */
export function buildReadmeHeader(options: ReadmeHeaderOptions): string {
  const { pkg, slug, type } = options
  const wp = (pkg['wp'] as Record<string, unknown> | undefined) ?? {}
  const fields = (wp[type] ?? {}) as ThemeHeaderFields & PluginHeaderFields
  const version = (pkg['version'] as string | undefined) ?? '1.0.0'
  const name = type === 'plugin' && fields.name
    ? fields.name
    : deriveName(pkg, slug, type)

  const contributors = fields.contributors ?? fields.author

  const lines: string[] = [`=== ${name} ===`, '']

  if (contributors) {
    lines.push(`Contributors: ${contributors}`)
  }
  if (type === 'plugin' && fields.donateLink) {
    lines.push(`Donate link: ${fields.donateLink}`)
  }
  if (type === 'plugin' && fields.tags) {
    lines.push(`Tags: ${fields.tags}`)
  }
  if (fields.requiresAtLeast) {
    lines.push(`Requires at least: ${fields.requiresAtLeast}`)
  }
  if (fields.testedUpTo) {
    lines.push(`Tested up to: ${fields.testedUpTo}`)
  }
  if (fields.requiresPHP) {
    lines.push(`Requires PHP: ${fields.requiresPHP}`)
  }
  lines.push(`Stable tag: ${version}`)
  if (fields.license) {
    lines.push(`License: ${fields.license}`)
  }
  if (fields.licenseUri) {
    lines.push(`License URI: ${fields.licenseUri}`)
  }

  lines.push('')
  return lines.join('\n') + '\n'
}

/**
 * Replace the header block in an existing readme.txt file.
 *
 * Scans from the top for a `=== Title ===` line, then replaces everything
 * up to (but not including) the first non-blank, non-header-field line.
 *
 * Returns `null` if no title line is found.
 */
export function replaceReadmeHeader(content: string, newHeader: string): string | null {
  const lines = content.split('\n')

  // Find title line
  const titleIdx = lines.findIndex((l) => /^===\s+.+\s+===$/.test(l))
  if (titleIdx === -1) {
    return null
  }

  // Walk past the title line and find where the header ends
  let endIdx = titleIdx + 1
  while (endIdx < lines.length) {
    const line = lines[endIdx]
    // Blank lines within the header block are fine
    if (line.trim() === '') {
      endIdx++
      continue
    }
    // Header field line: starts with a word followed by colon
    if (/^[A-Za-z][A-Za-z ]*:/.test(line)) {
      endIdx++
      continue
    }
    // Anything else means header block is over
    break
  }

  const afterHeader = lines.slice(endIdx).join('\n')
  return newHeader + afterHeader
}
