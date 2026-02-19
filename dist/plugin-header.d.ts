export interface PluginHeaderFields {
    /** Display name */
    name?: string;
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
    /** Text domain override (defaults to slug) */
    textDomain?: string;
    /** Domain path for translations */
    domainPath?: string;
    /** Whether the plugin can only be activated network-wide (multisite) */
    network?: string;
    /** Comma-separated list of required plugin slugs */
    requiresPlugins?: string;
}
export interface PluginHeaderOptions {
    /** package.json-style object with `name`, `version`, and `wp.plugin` */
    pkg: Record<string, unknown>;
    /** Plugin directory slug */
    slug: string;
}
/**
 * Build a WordPress plugin file header comment.
 *
 * Field order follows WP core conventions (`get_plugin_data()`).
 */
export declare function buildPluginHeader(options: PluginHeaderOptions): string;
