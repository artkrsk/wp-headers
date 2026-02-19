/**
 * Patch the `version` field for a specific plugin slug inside a TGM-style PHP array.
 *
 * Handles both `array()` and `[]` syntax, aligned `=>` whitespace,
 * mixed quote styles, nested function calls, and arbitrary field order.
 *
 * Returns the patched content, or the original content unchanged if:
 * - The slug is not found
 * - No version field exists in the slug's array block
 * - The version already matches
 */
export declare function patchTgmVersion(content: string, slug: string, version: string): string;
