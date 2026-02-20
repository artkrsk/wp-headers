/** Serialize fields into a `/* ... *​/` block comment */
export function buildComment(fields) {
    const lines = ['/*'];
    for (const [key, value] of Object.entries(fields)) {
        lines.push(`${key}: ${value}`);
    }
    lines.push('*/');
    return lines.join('\n') + '\n';
}
/** Serialize a titled readme header block: `=== Title ===\n\nKey: Value\n\n` */
export function buildReadmeBlock(title, fields) {
    const lines = [`=== ${title} ===`, ''];
    for (const [key, value] of Object.entries(fields)) {
        lines.push(`${key}: ${value}`);
    }
    lines.push('');
    return lines.join('\n') + '\n';
}
/** Replace the first `/* ... *​/` block comment in content. Returns `null` if not found. */
export function replaceComment(content, newComment) {
    const startIdx = content.indexOf('/*');
    if (startIdx === -1) {
        return null;
    }
    const endIdx = content.indexOf('*/', startIdx);
    if (endIdx === -1) {
        return null;
    }
    return content.slice(0, startIdx) + newComment + content.slice(endIdx + 2);
}
/** Replace the `=== ... ===` header block in content. Returns `null` if not found. */
export function replaceReadmeBlock(content, newBlock) {
    const lines = content.split('\n');
    const titleIdx = lines.findIndex((l) => /^===\s+.+\s+===$/.test(l));
    if (titleIdx === -1) {
        return null;
    }
    let endIdx = titleIdx + 1;
    while (endIdx < lines.length) {
        const line = lines[endIdx];
        if (line.trim() === '') {
            endIdx++;
            continue;
        }
        if (/^[A-Za-z][A-Za-z ]*:/.test(line)) {
            endIdx++;
            continue;
        }
        break;
    }
    const afterHeader = lines.slice(endIdx).join('\n');
    return newBlock + afterHeader;
}
