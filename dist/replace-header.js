/**
 * Replace a PHP plugin file header.
 *
 * Replaces everything from the start of `content` up to and including the first
 * `*\/` with `<?php` + the new header, preserving everything after.
 *
 * Returns `null` if no closing `*\/` is found (content unchanged).
 */
export function replacePluginFileHeader(content, newHeader) {
    const endIdx = content.indexOf('*/');
    if (endIdx === -1) {
        return null;
    }
    const afterHeader = content.slice(endIdx + 2);
    return `<?php\n${newHeader}\n${afterHeader.trimStart()}`;
}
