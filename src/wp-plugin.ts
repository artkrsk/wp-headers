import { titleCase } from './wp-helpers.js'

export interface PluginHeaderConfig {
  /** Plugin display name — always emitted */
  name: string
  /** Plugin version — always emitted */
  version: string
  /** Text domain — always emitted */
  textDomain: string
  /** Plugin URI */
  pluginUri?: string
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
  /** Update URI */
  updateUri?: string
  /** Domain path for translations */
  domainPath?: string
  /** Whether the plugin can only be activated network-wide (multisite) */
  network?: string
  /** Comma-separated list of required plugin slugs */
  requiresPlugins?: string
}

export interface PluginReadmeConfig {
  /** Plugin display name — used in `=== Title ===` line */
  name: string
  /** Stable tag (version) */
  stableTag: string
  /** WordPress.org username(s) */
  contributors?: string
  /** Donate link URL */
  donateLink?: string
  /** Comma-separated tag list */
  tags?: string
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

/** Convert a PluginHeaderConfig to ordered WP fields */
export function wpPluginHeader(config: PluginHeaderConfig): Record<string, string> {
  const fields: Record<string, string> = {}
  fields['Plugin Name'] = config.name
  if (config.pluginUri) { fields['Plugin URI'] = config.pluginUri }
  if (config.description) { fields['Description'] = config.description }
  fields['Version'] = config.version
  if (config.author) { fields['Author'] = config.author }
  if (config.authorUri) { fields['Author URI'] = config.authorUri }
  if (config.license) { fields['License'] = config.license }
  if (config.licenseUri) { fields['License URI'] = config.licenseUri }
  if (config.requiresAtLeast) { fields['Requires at least'] = config.requiresAtLeast }
  if (config.requiresPHP) { fields['Requires PHP'] = config.requiresPHP }
  if (config.testedUpTo) { fields['Tested up to'] = config.testedUpTo }
  if (config.updateUri) { fields['Update URI'] = config.updateUri }
  fields['Text Domain'] = config.textDomain
  if (config.domainPath) { fields['Domain Path'] = config.domainPath }
  if (config.network) { fields['Network'] = config.network }
  if (config.requiresPlugins) { fields['Requires Plugins'] = config.requiresPlugins }
  return fields
}

/** Convert a PluginReadmeConfig to ordered WP readme fields */
export function wpPluginReadme(config: PluginReadmeConfig): Record<string, string> {
  const fields: Record<string, string> = {}
  if (config.contributors) { fields['Contributors'] = config.contributors }
  if (config.donateLink) { fields['Donate link'] = config.donateLink }
  if (config.tags) { fields['Tags'] = config.tags }
  if (config.requiresAtLeast) { fields['Requires at least'] = config.requiresAtLeast }
  if (config.testedUpTo) { fields['Tested up to'] = config.testedUpTo }
  if (config.requiresPHP) { fields['Requires PHP'] = config.requiresPHP }
  fields['Stable tag'] = config.stableTag
  if (config.license) { fields['License'] = config.license }
  if (config.licenseUri) { fields['License URI'] = config.licenseUri }
  return fields
}

/** Extract PluginHeaderConfig from a package.json object */
export function pluginHeaderFromPkg(pkg: Record<string, unknown>, slug: string): PluginHeaderConfig {
  const wp = (pkg['wp'] as Record<string, unknown> | undefined) ?? {}
  const plugin = (wp['plugin'] ?? {}) as Record<string, string | undefined>
  const version = (pkg['version'] as string | undefined) ?? '1.0.0'
  const name = plugin['name'] ?? titleCase(slug)

  return {
    name,
    version,
    textDomain: plugin['textDomain'] ?? slug,
    pluginUri: plugin['pluginUri'],
    description: plugin['description'],
    author: plugin['author'],
    authorUri: plugin['authorUri'],
    license: plugin['license'],
    licenseUri: plugin['licenseUri'],
    requiresAtLeast: plugin['requiresAtLeast'],
    requiresPHP: plugin['requiresPHP'],
    testedUpTo: plugin['testedUpTo'],
    updateUri: plugin['updateUri'],
    domainPath: plugin['domainPath'],
    network: plugin['network'],
    requiresPlugins: plugin['requiresPlugins'],
  }
}

/** Extract PluginReadmeConfig from a package.json object */
export function pluginReadmeFromPkg(pkg: Record<string, unknown>, slug: string): PluginReadmeConfig {
  const wp = (pkg['wp'] as Record<string, unknown> | undefined) ?? {}
  const plugin = (wp['plugin'] ?? {}) as Record<string, string | undefined>
  const version = (pkg['version'] as string | undefined) ?? '1.0.0'
  const name = plugin['name'] ?? titleCase(slug)
  const contributors = plugin['contributors'] ?? plugin['author']

  return {
    name,
    stableTag: version,
    contributors,
    donateLink: plugin['donateLink'],
    tags: plugin['tags'],
    requiresAtLeast: plugin['requiresAtLeast'],
    testedUpTo: plugin['testedUpTo'],
    requiresPHP: plugin['requiresPHP'],
    license: plugin['license'],
    licenseUri: plugin['licenseUri'],
  }
}
