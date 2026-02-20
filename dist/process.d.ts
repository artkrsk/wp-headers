/** Read a UTF-8 file, stripping BOM if present */
export declare function readText(filePath: string): string;
export interface HeaderMapping {
    type: 'theme' | 'plugin';
    slug: string;
    entityDir: string;
    /** Base path to resolve TGM file from (usually the theme's PHP source dir) */
    tgmBasePath: string;
    /** Subdirectory within entityDir containing PHP source files */
    phpSrc?: string;
}
export declare function processMapping(mapping: HeaderMapping): void;
