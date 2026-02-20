import { deriveName } from './wp-helpers.js';
/** Convert a ThemeStyleConfig to ordered WP fields */
export function wpThemeStyle(config) {
    const fields = {};
    fields['Theme Name'] = config.name;
    if (config.uri) {
        fields['Theme URI'] = config.uri;
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
    if (config.tags) {
        fields['Tags'] = config.tags;
    }
    if (config.template) {
        fields['Template'] = config.template;
    }
    fields['Text Domain'] = config.textDomain;
    if (config.domainPath) {
        fields['Domain Path'] = config.domainPath;
    }
    if (config.updateUri) {
        fields['Update URI'] = config.updateUri;
    }
    return fields;
}
/** Convert a ThemeReadmeConfig to ordered WP readme fields */
export function wpThemeReadme(config) {
    const fields = {};
    if (config.contributors) {
        fields['Contributors'] = config.contributors;
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
/** Extract ThemeStyleConfig from a package.json object */
export function themeStyleFromPkg(pkg, slug) {
    const wp = pkg['wp'] ?? {};
    const theme = (wp['theme'] ?? {});
    const version = pkg['version'] ?? '1.0.0';
    const name = deriveName(pkg['name'], slug, '-theme');
    return {
        name,
        version,
        textDomain: theme['textDomain'] ?? slug,
        uri: theme['uri'],
        description: theme['description'],
        author: theme['author'],
        authorUri: theme['authorUri'],
        license: theme['license'],
        licenseUri: theme['licenseUri'],
        requiresAtLeast: theme['requiresAtLeast'],
        requiresPHP: theme['requiresPHP'],
        testedUpTo: theme['testedUpTo'],
        tags: theme['tags'],
        template: theme['template'],
        domainPath: theme['domainPath'],
        updateUri: theme['updateUri'],
    };
}
/** Extract ThemeReadmeConfig from a package.json object */
export function themeReadmeFromPkg(pkg, slug) {
    const wp = pkg['wp'] ?? {};
    const theme = (wp['theme'] ?? {});
    const version = pkg['version'] ?? '1.0.0';
    const name = deriveName(pkg['name'], slug, '-theme');
    const contributors = theme['contributors'] ?? theme['author'];
    return {
        name,
        stableTag: version,
        contributors,
        requiresAtLeast: theme['requiresAtLeast'],
        testedUpTo: theme['testedUpTo'],
        requiresPHP: theme['requiresPHP'],
        license: theme['license'],
        licenseUri: theme['licenseUri'],
    };
}
