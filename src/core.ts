/** Serialize fields into a `/* ... *​/` block comment */
export function buildComment(fields: Record<string, string>): string {
  const lines: string[] = ['/*']
  for (const [key, value] of Object.entries(fields)) {
    lines.push(` * ${key}: ${value}`)
  }
  lines.push(' */')
  return lines.join('\n') + '\n'
}

/** Serialize a titled readme header block: `=== Title ===\n\nKey: Value\n\n` */
export function buildReadmeBlock(title: string, fields: Record<string, string>): string {
  const lines: string[] = [`=== ${title} ===`, '']
  for (const [key, value] of Object.entries(fields)) {
    lines.push(`${key}: ${value}`)
  }
  lines.push('')
  return lines.join('\n') + '\n'
}

/** Replace the first `/* ... *​/` block comment in content. Returns `null` if not found. */
export function replaceComment(content: string, newComment: string): string | null {
  const startIdx = content.indexOf('/*')
  if (startIdx === -1) {
    return null
  }
  const endIdx = content.indexOf('*/', startIdx)
  if (endIdx === -1) {
    return null
  }
  const after = content.slice(endIdx + 2).replace(/^\n*/, '')
  return content.slice(0, startIdx) + newComment + '\n' + after
}

/** Replace the `=== ... ===` header block in content. Returns `null` if not found. */
export function replaceReadmeBlock(content: string, newBlock: string): string | null {
  content = content.replace(/\r\n/g, '\n')
  const lines = content.split('\n')

  const titleIdx = lines.findIndex((l) => /^===\s+.+\s+===$/.test(l))
  if (titleIdx === -1) {
    return null
  }

  let endIdx = titleIdx + 1
  while (endIdx < lines.length) {
    const line = lines[endIdx]
    if (line.trim() === '') {
      endIdx++
      continue
    }
    if (/^[A-Za-z][A-Za-z ]*:/.test(line)) {
      endIdx++
      continue
    }
    break
  }

  const afterHeader = lines.slice(endIdx).join('\n')
  return newBlock + afterHeader
}
