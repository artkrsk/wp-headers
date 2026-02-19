import { describe, it, expect } from 'vitest'
import { replacePluginFileHeader } from '../src/replace-header'

describe('replacePluginFileHeader', () => {
  it('replaces standard /* ... */ header', () => {
    const content = `<?php
/*
Plugin Name: Old Name
Version: 1.0.0
*/

namespace MyPlugin;

class Main {}
`
    const newHeader = `/*
Plugin Name: New Name
Version: 2.0.0
*/
`
    const result = replacePluginFileHeader(content, newHeader)

    expect(result).toContain('<?php')
    expect(result).toContain('Plugin Name: New Name')
    expect(result).toContain('Version: 2.0.0')
    expect(result).toContain('namespace MyPlugin;')
    expect(result).toContain('class Main {}')
    expect(result).not.toContain('Old Name')
  })

  it('replaces /** ... */ docblock style header', () => {
    const content = `<?php
/**
 * Plugin Name: Old Name
 * Version: 1.0.0
 */

function init() {}
`
    const newHeader = `/*
Plugin Name: New Name
Version: 2.0.0
*/
`
    const result = replacePluginFileHeader(content, newHeader)

    expect(result).toContain('Plugin Name: New Name')
    expect(result).toContain('function init() {}')
    expect(result).not.toContain('Old Name')
  })

  it('preserves code after header with blank lines', () => {
    const content = `<?php
/*
Plugin Name: Test
*/



// Important code
$x = 1;
`
    const result = replacePluginFileHeader(content, '/*\nNew\n*/\n')

    expect(result).toContain('// Important code')
    expect(result).toContain('$x = 1;')
  })

  it('returns null when no closing */ found', () => {
    const content = `<?php
/* This comment is never closed
echo "hello";
`
    const result = replacePluginFileHeader(content, '/*\nNew\n*/\n')

    expect(result).toBeNull()
  })

  it('handles file where */ appears at very end', () => {
    const content = `<?php
/*
Plugin Name: Test
*/`
    const result = replacePluginFileHeader(content, '/*\nNew\n*/\n')

    expect(result).toContain('New')
    expect(result!.startsWith('<?php')).toBe(true)
  })

  it('starts output with <?php even if original had different opening', () => {
    const content = `<?PHP
/*
Old
*/
code();
`
    const result = replacePluginFileHeader(content, '/*\nNew\n*/\n')

    expect(result!.startsWith('<?php\n')).toBe(true)
    expect(result).toContain('code();')
  })
})
