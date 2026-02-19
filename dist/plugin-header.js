function titleCase(str) {
    return str
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
/**
 * Build a WordPress plugin file header comment.
 *
 * Field order follows WP core conventions (`get_plugin_data()`).
 */
export function buildPluginHeader(options) {
    const { pkg, slug } = options;
    const plugin = (pkg['wp']?.['plugin'] ??
        {});
    const version = pkg['version'] ?? '1.0.0';
    const pluginName = plugin.name ?? titleCase(slug);
    const lines = ['/*', `Plugin Name: ${pluginName}`];
    if (plugin.pluginUri) {
        lines.push(`Plugin URI: ${plugin.pluginUri}`);
    }
    if (plugin.description) {
        lines.push(`Description: ${plugin.description}`);
    }
    lines.push(`Version: ${version}`);
    if (plugin.author) {
        lines.push(`Author: ${plugin.author}`);
    }
    if (plugin.authorUri) {
        lines.push(`Author URI: ${plugin.authorUri}`);
    }
    if (plugin.license) {
        lines.push(`License: ${plugin.license}`);
    }
    if (plugin.licenseUri) {
        lines.push(`License URI: ${plugin.licenseUri}`);
    }
    if (plugin.requiresAtLeast) {
        lines.push(`Requires at least: ${plugin.requiresAtLeast}`);
    }
    if (plugin.requiresPHP) {
        lines.push(`Requires PHP: ${plugin.requiresPHP}`);
    }
    if (plugin.testedUpTo) {
        lines.push(`Tested up to: ${plugin.testedUpTo}`);
    }
    if (plugin.updateUri) {
        lines.push(`Update URI: ${plugin.updateUri}`);
    }
    lines.push(`Text Domain: ${plugin.textDomain ?? slug}`);
    if (plugin.domainPath) {
        lines.push(`Domain Path: ${plugin.domainPath}`);
    }
    if (plugin.network) {
        lines.push(`Network: ${plugin.network}`);
    }
    if (plugin.requiresPlugins) {
        lines.push(`Requires Plugins: ${plugin.requiresPlugins}`);
    }
    lines.push('*/');
    return lines.join('\n') + '\n';
}
