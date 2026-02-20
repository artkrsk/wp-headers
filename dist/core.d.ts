/** Serialize fields into a `/* ... *​/` block comment */
export declare function buildComment(fields: Record<string, string>): string;
/** Serialize a titled readme header block: `=== Title ===\n\nKey: Value\n\n` */
export declare function buildReadmeBlock(title: string, fields: Record<string, string>): string;
/** Replace the first `/* ... *​/` block comment in content. Returns `null` if not found. */
export declare function replaceComment(content: string, newComment: string): string | null;
/** Replace the `=== ... ===` header block in content. Returns `null` if not found. */
export declare function replaceReadmeBlock(content: string, newBlock: string): string | null;
