/**
 * Replace a PHP plugin file header.
 *
 * Replaces everything from the start of `content` up to and including the first
 * `*\/` with `<?php` + the new header, preserving everything after.
 *
 * Returns `null` if no closing `*\/` is found (content unchanged).
 */
export declare function replacePluginFileHeader(content: string, newHeader: string): string | null;
