function titleCase(str) {
    return str
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
/**
 * Build a WordPress `style.css` theme header comment.
 *
 * Field order follows WP core conventions (`class-wp-theme.php`).
 */
export function buildThemeHeader(options) {
    const { pkg, slug } = options;
    const theme = (pkg['wp']?.['theme'] ??
        {});
    const version = pkg['version'] ?? '1.0.0';
    const name = pkg['name'] ?? '';
    const themeName = titleCase(name.replace(/^@[\w-]+\//, '').replace(/-theme$/, '')) ||
        titleCase(slug);
    const lines = ['/*', `Theme Name: ${themeName}`];
    if (theme.uri) {
        lines.push(`Theme URI: ${theme.uri}`);
    }
    if (theme.description) {
        lines.push(`Description: ${theme.description}`);
    }
    lines.push(`Version: ${version}`);
    if (theme.author) {
        lines.push(`Author: ${theme.author}`);
    }
    if (theme.authorUri) {
        lines.push(`Author URI: ${theme.authorUri}`);
    }
    if (theme.license) {
        lines.push(`License: ${theme.license}`);
    }
    if (theme.licenseUri) {
        lines.push(`License URI: ${theme.licenseUri}`);
    }
    if (theme.requiresAtLeast) {
        lines.push(`Requires at least: ${theme.requiresAtLeast}`);
    }
    if (theme.requiresPHP) {
        lines.push(`Requires PHP: ${theme.requiresPHP}`);
    }
    if (theme.testedUpTo) {
        lines.push(`Tested up to: ${theme.testedUpTo}`);
    }
    if (theme.tags) {
        lines.push(`Tags: ${theme.tags}`);
    }
    if (theme.template) {
        lines.push(`Template: ${theme.template}`);
    }
    lines.push(`Text Domain: ${theme.textDomain ?? slug}`);
    if (theme.domainPath) {
        lines.push(`Domain Path: ${theme.domainPath}`);
    }
    if (theme.updateUri) {
        lines.push(`Update URI: ${theme.updateUri}`);
    }
    lines.push('*/');
    return lines.join('\n') + '\n';
}
