export interface ThemeHeaderFields {
    /** Theme URI */
    uri?: string;
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
    /** Comma-separated tag list */
    tags?: string;
    /** Parent theme slug (for child themes) */
    template?: string;
    /** Text domain override (defaults to slug) */
    textDomain?: string;
    /** Domain path for translations */
    domainPath?: string;
    /** Update URI */
    updateUri?: string;
}
export interface ThemeHeaderOptions {
    /** package.json-style object with `name`, `version`, and `wp.theme` */
    pkg: Record<string, unknown>;
    /** Theme directory slug */
    slug: string;
}
/**
 * Build a WordPress `style.css` theme header comment.
 *
 * Field order follows WP core conventions (`class-wp-theme.php`).
 */
export declare function buildThemeHeader(options: ThemeHeaderOptions): string;
