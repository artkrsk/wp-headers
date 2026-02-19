function titleCase(str) {
    return str
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
function deriveName(pkg, slug, type) {
    const name = pkg['name'] ?? '';
    const suffix = type === 'theme' ? '-theme' : '-plugin';
    return titleCase(name.replace(/^@[\w-]+\//, '').replace(new RegExp(`${suffix}$`), '')) || titleCase(slug);
}
/**
 * Build a WordPress readme.txt header block.
 *
 * Generates the `=== Name ===` title line followed by key: value fields.
 * Field order follows WordPress.org conventions.
 */
export function buildReadmeHeader(options) {
    const { pkg, slug, type } = options;
    const wp = pkg['wp'] ?? {};
    const fields = (wp[type] ?? {});
    const version = pkg['version'] ?? '1.0.0';
    const name = type === 'plugin' && fields.name
        ? fields.name
        : deriveName(pkg, slug, type);
    const contributors = fields.contributors ?? fields.author;
    const lines = [`=== ${name} ===`, ''];
    if (contributors) {
        lines.push(`Contributors: ${contributors}`);
    }
    if (type === 'plugin' && fields.donateLink) {
        lines.push(`Donate link: ${fields.donateLink}`);
    }
    if (type === 'plugin' && fields.tags) {
        lines.push(`Tags: ${fields.tags}`);
    }
    if (fields.requiresAtLeast) {
        lines.push(`Requires at least: ${fields.requiresAtLeast}`);
    }
    if (fields.testedUpTo) {
        lines.push(`Tested up to: ${fields.testedUpTo}`);
    }
    if (fields.requiresPHP) {
        lines.push(`Requires PHP: ${fields.requiresPHP}`);
    }
    lines.push(`Stable tag: ${version}`);
    if (fields.license) {
        lines.push(`License: ${fields.license}`);
    }
    if (fields.licenseUri) {
        lines.push(`License URI: ${fields.licenseUri}`);
    }
    lines.push('');
    return lines.join('\n') + '\n';
}
/**
 * Replace the header block in an existing readme.txt file.
 *
 * Scans from the top for a `=== Title ===` line, then replaces everything
 * up to (but not including) the first non-blank, non-header-field line.
 *
 * Returns `null` if no title line is found.
 */
export function replaceReadmeHeader(content, newHeader) {
    const lines = content.split('\n');
    // Find title line
    const titleIdx = lines.findIndex((l) => /^===\s+.+\s+===$/.test(l));
    if (titleIdx === -1) {
        return null;
    }
    // Walk past the title line and find where the header ends
    let endIdx = titleIdx + 1;
    while (endIdx < lines.length) {
        const line = lines[endIdx];
        // Blank lines within the header block are fine
        if (line.trim() === '') {
            endIdx++;
            continue;
        }
        // Header field line: starts with a word followed by colon
        if (/^[A-Za-z][A-Za-z ]*:/.test(line)) {
            endIdx++;
            continue;
        }
        // Anything else means header block is over
        break;
    }
    const afterHeader = lines.slice(endIdx).join('\n');
    return newHeader + afterHeader;
}
