export interface ThemeHeaderFields {
  /** Theme URI */
  uri?: string
  /** Short description */
  description?: string
  /** Author name */
  author?: string
  /** Author URI */
  authorUri?: string
  /** License name */
  license?: string
  /** License URI */
  licenseUri?: string
  /** Minimum WordPress version */
  requiresAtLeast?: string
  /** Minimum PHP version */
  requiresPHP?: string
  /** Tested up to WordPress version */
  testedUpTo?: string
  /** Comma-separated tag list */
  tags?: string
  /** Parent theme slug (for child themes) */
  template?: string
  /** Text domain override (defaults to slug) */
  textDomain?: string
  /** Domain path for translations */
  domainPath?: string
  /** Update URI */
  updateUri?: string
}

export interface ThemeHeaderOptions {
  /** package.json-style object with `name`, `version`, and `wp.theme` */
  pkg: Record<string, unknown>
  /** Theme directory slug */
  slug: string
}

function titleCase(str: string): string {
  return str
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/**
 * Build a WordPress `style.css` theme header comment.
 *
 * Field order follows WP core conventions (`class-wp-theme.php`).
 */
export function buildThemeHeader(options: ThemeHeaderOptions): string {
  const { pkg, slug } = options
  const theme = ((pkg['wp'] as Record<string, unknown>)?.['theme'] ??
    {}) as ThemeHeaderFields
  const version = (pkg['version'] as string | undefined) ?? '1.0.0'
  const name = (pkg['name'] as string | undefined) ?? ''
  const themeName =
    titleCase(name.replace(/^@[\w-]+\//, '').replace(/-theme$/, '')) ||
    titleCase(slug)

  const lines: string[] = ['/*', `Theme Name: ${themeName}`]

  if (theme.uri) {
    lines.push(`Theme URI: ${theme.uri}`)
  }
  if (theme.description) {
    lines.push(`Description: ${theme.description}`)
  }
  lines.push(`Version: ${version}`)
  if (theme.author) {
    lines.push(`Author: ${theme.author}`)
  }
  if (theme.authorUri) {
    lines.push(`Author URI: ${theme.authorUri}`)
  }
  if (theme.license) {
    lines.push(`License: ${theme.license}`)
  }
  if (theme.licenseUri) {
    lines.push(`License URI: ${theme.licenseUri}`)
  }
  if (theme.requiresAtLeast) {
    lines.push(`Requires at least: ${theme.requiresAtLeast}`)
  }
  if (theme.requiresPHP) {
    lines.push(`Requires PHP: ${theme.requiresPHP}`)
  }
  if (theme.testedUpTo) {
    lines.push(`Tested up to: ${theme.testedUpTo}`)
  }
  if (theme.tags) {
    lines.push(`Tags: ${theme.tags}`)
  }
  if (theme.template) {
    lines.push(`Template: ${theme.template}`)
  }
  lines.push(`Text Domain: ${theme.textDomain ?? slug}`)
  if (theme.domainPath) {
    lines.push(`Domain Path: ${theme.domainPath}`)
  }
  if (theme.updateUri) {
    lines.push(`Update URI: ${theme.updateUri}`)
  }
  lines.push('*/')

  return lines.join('\n') + '\n'
}
