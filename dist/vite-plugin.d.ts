import type { Plugin } from 'vite';
export interface HeaderMapping {
    type: 'theme' | 'plugin';
    slug: string;
    entityDir: string;
    /** Base path to resolve TGM file from (usually the theme's PHP source dir) */
    tgmBasePath: string;
    /** Subdirectory within entityDir containing PHP source files */
    phpSrc?: string;
}
/**
 * Vite plugin that generates WordPress file headers (style.css, plugin PHP)
 * and patches TGM version entries on build and during dev server.
 */
export declare function wpHeaders(mappings: HeaderMapping[]): Plugin;
