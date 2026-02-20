export interface PluginHeaderConfig {
    /** Plugin display name — always emitted */
    name: string;
    /** Plugin version — always emitted */
    version: string;
    /** Text domain — always emitted */
    textDomain: string;
    /** Plugin URI */
    pluginUri?: string;
    /** Short description */
    description?: string;
    /** Author name */
    author?: string;
    /** Author URI */
    authorUri?: string;
    /** License name */
    license?: string;
    /** License URI */
    licenseUri?: string;
    /** Minimum WordPress version */
    requiresAtLeast?: string;
    /** Minimum PHP version */
    requiresPHP?: string;
    /** Tested up to WordPress version */
    testedUpTo?: string;
    /** Update URI */
    updateUri?: string;
    /** Domain path for translations */
    domainPath?: string;
    /** Whether the plugin can only be activated network-wide (multisite) */
    network?: string;
    /** Comma-separated list of required plugin slugs */
    requiresPlugins?: string;
}
export interface PluginReadmeConfig {
    /** Plugin display name — used in `=== Title ===` line */
    name: string;
    /** Stable tag (version) */
    stableTag: string;
    /** WordPress.org username(s) */
    contributors?: string;
    /** Donate link URL */
    donateLink?: string;
    /** Comma-separated tag list */
    tags?: string;
    /** Minimum WordPress version */
    requiresAtLeast?: string;
    /** Tested up to WordPress version */
    testedUpTo?: string;
    /** Minimum PHP version */
    requiresPHP?: string;
    /** License name */
    license?: string;
    /** License URI */
    licenseUri?: string;
}
/** Convert a PluginHeaderConfig to ordered WP fields */
export declare function wpPluginHeader(config: PluginHeaderConfig): Record<string, string>;
/** Convert a PluginReadmeConfig to ordered WP readme fields */
export declare function wpPluginReadme(config: PluginReadmeConfig): Record<string, string>;
/** Extract PluginHeaderConfig from a package.json object */
export declare function pluginHeaderFromPkg(pkg: Record<string, unknown>, slug: string): PluginHeaderConfig;
/** Extract PluginReadmeConfig from a package.json object */
export declare function pluginReadmeFromPkg(pkg: Record<string, unknown>, slug: string): PluginReadmeConfig;
