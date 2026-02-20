import { deriveName } from './wp-helpers.js'

export interface ThemeStyleConfig {
  /** Theme display name — always emitted */
  name: string
  /** Theme version — always emitted */
  version: string
  /** Text domain — always emitted */
  textDomain: string
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
  /** Domain path for translations */
  domainPath?: string
  /** Update URI */
  updateUri?: string
}

export interface ThemeReadmeConfig {
  /** Theme display name — used in `=== Title ===` line */
  name: string
  /** Stable tag (version) */
  stableTag: string
  /** WordPress.org username(s) */
  contributors?: string
  /** Minimum WordPress version */
  requiresAtLeast?: string
  /** Tested up to WordPress version */
  testedUpTo?: string
  /** Minimum PHP version */
  requiresPHP?: string
  /** License name */
  license?: string
  /** License URI */
  licenseUri?: string
}

/** Convert a ThemeStyleConfig to ordered WP fields */
export function wpThemeStyle(config: ThemeStyleConfig): Record<string, string> {
  const fields: Record<string, string> = {}
  fields['Theme Name'] = config.name
  if (config.uri) { fields['Theme URI'] = config.uri }
  if (config.description) { fields['Description'] = config.description }
  fields['Version'] = config.version
  if (config.author) { fields['Author'] = config.author }
  if (config.authorUri) { fields['Author URI'] = config.authorUri }
  if (config.license) { fields['License'] = config.license }
  if (config.licenseUri) { fields['License URI'] = config.licenseUri }
  if (config.requiresAtLeast) { fields['Requires at least'] = config.requiresAtLeast }
  if (config.requiresPHP) { fields['Requires PHP'] = config.requiresPHP }
  if (config.testedUpTo) { fields['Tested up to'] = config.testedUpTo }
  if (config.tags) { fields['Tags'] = config.tags }
  if (config.template) { fields['Template'] = config.template }
  fields['Text Domain'] = config.textDomain
  if (config.domainPath) { fields['Domain Path'] = config.domainPath }
  if (config.updateUri) { fields['Update URI'] = config.updateUri }
  return fields
}

/** Convert a ThemeReadmeConfig to ordered WP readme fields */
export function wpThemeReadme(config: ThemeReadmeConfig): Record<string, string> {
  const fields: Record<string, string> = {}
  if (config.contributors) { fields['Contributors'] = config.contributors }
  if (config.requiresAtLeast) { fields['Requires at least'] = config.requiresAtLeast }
  if (config.testedUpTo) { fields['Tested up to'] = config.testedUpTo }
  if (config.requiresPHP) { fields['Requires PHP'] = config.requiresPHP }
  fields['Stable tag'] = config.stableTag
  if (config.license) { fields['License'] = config.license }
  if (config.licenseUri) { fields['License URI'] = config.licenseUri }
  return fields
}

/** Extract ThemeStyleConfig from a package.json object */
export function themeStyleFromPkg(pkg: Record<string, unknown>, slug: string): ThemeStyleConfig {
  const wp = (pkg['wp'] as Record<string, unknown> | undefined) ?? {}
  const theme = (wp['theme'] ?? {}) as Record<string, string | undefined>
  const version = (pkg['version'] as string | undefined) ?? '1.0.0'
  const name = deriveName(pkg['name'] as string | undefined, slug, '-theme')

  return {
    name,
    version,
    textDomain: theme['textDomain'] ?? slug,
    uri: theme['uri'],
    description: theme['description'],
    author: theme['author'],
    authorUri: theme['authorUri'],
    license: theme['license'],
    licenseUri: theme['licenseUri'],
    requiresAtLeast: theme['requiresAtLeast'],
    requiresPHP: theme['requiresPHP'],
    testedUpTo: theme['testedUpTo'],
    tags: theme['tags'],
    template: theme['template'],
    domainPath: theme['domainPath'],
    updateUri: theme['updateUri'],
  }
}

/** Extract ThemeReadmeConfig from a package.json object */
export function themeReadmeFromPkg(pkg: Record<string, unknown>, slug: string): ThemeReadmeConfig {
  const wp = (pkg['wp'] as Record<string, unknown> | undefined) ?? {}
  const theme = (wp['theme'] ?? {}) as Record<string, string | undefined>
  const version = (pkg['version'] as string | undefined) ?? '1.0.0'
  const name = deriveName(pkg['name'] as string | undefined, slug, '-theme')
  const contributors = theme['contributors'] ?? theme['author']

  return {
    name,
    stableTag: version,
    contributors,
    requiresAtLeast: theme['requiresAtLeast'],
    testedUpTo: theme['testedUpTo'],
    requiresPHP: theme['requiresPHP'],
    license: theme['license'],
    licenseUri: theme['licenseUri'],
  }
}
