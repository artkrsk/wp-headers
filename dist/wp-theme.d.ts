export interface ThemeStyleConfig {
    /** Theme display name — always emitted */
    name: string;
    /** Theme version — always emitted */
    version: string;
    /** Text domain — always emitted */
    textDomain: string;
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
    /** Domain path for translations */
    domainPath?: string;
    /** Update URI */
    updateUri?: string;
}
export interface ThemeReadmeConfig {
    /** Theme display name — used in `=== Title ===` line */
    name: string;
    /** Stable tag (version) */
    stableTag: string;
    /** WordPress.org username(s) */
    contributors?: string;
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
/** Convert a ThemeStyleConfig to ordered WP fields */
export declare function wpThemeStyle(config: ThemeStyleConfig): Record<string, string>;
/** Convert a ThemeReadmeConfig to ordered WP readme fields */
export declare function wpThemeReadme(config: ThemeReadmeConfig): Record<string, string>;
/** Extract ThemeStyleConfig from a package.json object */
export declare function themeStyleFromPkg(pkg: Record<string, unknown>, slug: string): ThemeStyleConfig;
/** Extract ThemeReadmeConfig from a package.json object */
export declare function themeReadmeFromPkg(pkg: Record<string, unknown>, slug: string): ThemeReadmeConfig;
