/** Convert a hyphenated string to Title Case */
export function titleCase(str) {
    return str
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
/**
 * Derive a display name from pkg.name, stripping `@scope/` prefix and type suffix,
 * then title-casing. Falls back to `titleCase(slug)`.
 */
export function deriveName(pkgName, slug, suffix) {
    const name = pkgName ?? '';
    return titleCase(name.replace(/^@[\w-]+\//, '').replace(new RegExp(`${suffix}$`), '')) || titleCase(slug);
}
