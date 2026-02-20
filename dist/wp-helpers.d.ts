/** Convert a hyphenated string to Title Case */
export declare function titleCase(str: string): string;
/**
 * Derive a display name from pkg.name, stripping `@scope/` prefix and type suffix,
 * then title-casing. Falls back to `titleCase(slug)`.
 */
export declare function deriveName(pkgName: string | undefined, slug: string, suffix: string): string;
