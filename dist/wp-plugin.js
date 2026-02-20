import { titleCase } from './wp-helpers.js';
/** Convert a PluginHeaderConfig to ordered WP fields */
export function wpPluginHeader(config) {
    const fields = {};
    fields['Plugin Name'] = config.name;
    if (config.pluginUri) {
        fields['Plugin URI'] = config.pluginUri;
    }
    if (config.description) {
        fields['Description'] = config.description;
    }
    fields['Version'] = config.version;
    if (config.author) {
        fields['Author'] = config.author;
    }
    if (config.authorUri) {
        fields['Author URI'] = config.authorUri;
    }
    if (config.license) {
        fields['License'] = config.license;
    }
    if (config.licenseUri) {
        fields['License URI'] = config.licenseUri;
    }
    if (config.requiresAtLeast) {
        fields['Requires at least'] = config.requiresAtLeast;
    }
    if (config.requiresPHP) {
        fields['Requires PHP'] = config.requiresPHP;
    }
    if (config.testedUpTo) {
        fields['Tested up to'] = config.testedUpTo;
    }
    if (config.updateUri) {
        fields['Update URI'] = config.updateUri;
    }
    fields['Text Domain'] = config.textDomain;
    if (config.domainPath) {
        fields['Domain Path'] = config.domainPath;
    }
    if (config.network) {
        fields['Network'] = config.network;
    }
    if (config.requiresPlugins) {
        fields['Requires Plugins'] = config.requiresPlugins;
    }
    return fields;
}
/** Convert a PluginReadmeConfig to ordered WP readme fields */
export function wpPluginReadme(config) {
    const fields = {};
    if (config.contributors) {
        fields['Contributors'] = config.contributors;
    }
    if (config.donateLink) {
        fields['Donate link'] = config.donateLink;
    }
    if (config.tags) {
        fields['Tags'] = config.tags;
    }
    if (config.requiresAtLeast) {
        fields['Requires at least'] = config.requiresAtLeast;
    }
    if (config.testedUpTo) {
        fields['Tested up to'] = config.testedUpTo;
    }
    if (config.requiresPHP) {
        fields['Requires PHP'] = config.requiresPHP;
    }
    fields['Stable tag'] = config.stableTag;
    if (config.license) {
        fields['License'] = config.license;
    }
    if (config.licenseUri) {
        fields['License URI'] = config.licenseUri;
    }
    return fields;
}
/** Extract PluginHeaderConfig from a package.json object */
export function pluginHeaderFromPkg(pkg, slug) {
    const wp = pkg['wp'] ?? {};
    const plugin = (wp['plugin'] ?? {});
    const version = pkg['version'] ?? '1.0.0';
    const name = plugin['name'] ?? titleCase(slug);
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
    };
}
/** Extract PluginReadmeConfig from a package.json object */
export function pluginReadmeFromPkg(pkg, slug) {
    const wp = pkg['wp'] ?? {};
    const plugin = (wp['plugin'] ?? {});
    const version = pkg['version'] ?? '1.0.0';
    const name = plugin['name'] ?? titleCase(slug);
    const contributors = plugin['contributors'] ?? plugin['author'];
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
    };
}
