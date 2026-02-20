import { describe, it, expect } from 'vitest'
import { buildComment, buildReadmeBlock, replaceComment, replaceReadmeBlock } from '../src/core'

describe('buildComment', () => {
  it('serializes fields into a block comment', () => {
    const result = buildComment({
      'Theme Name': 'Velum',
      'Version': '2.0.0',
      'Text Domain': 'velum',
    })

    expect(result).toBe('/*\nTheme Name: Velum\nVersion: 2.0.0\nText Domain: velum\n*/\n')
  })

  it('preserves iteration order', () => {
    const result = buildComment({
      'Plugin Name': 'Test',
      'Description': 'Desc',
      'Version': '1.0.0',
      'Author': 'Author',
    })

    const lines = result.split('\n')
    const fieldOrder = lines
      .filter((l) => l.includes(':'))
      .map((l) => l.split(':')[0].trim())

    expect(fieldOrder).toEqual(['Plugin Name', 'Description', 'Version', 'Author'])
  })

  it('wraps with /* and */ delimiters', () => {
    const result = buildComment({ 'Name': 'Test' })
    expect(result).toMatch(/^\/\*\n/)
    expect(result).toMatch(/\*\/\n$/)
  })

  it('handles special characters in values', () => {
    const result = buildComment({
      'Description': 'Quotes "here" & ampersands <there>',
      'Author': "O'Brien & Co.",
    })

    expect(result).toContain('Quotes "here" & ampersands <there>')
    expect(result).toContain("O'Brien & Co.")
  })

  it('handles unicode in values', () => {
    const result = buildComment({ 'Author': 'Артём Сёмкин' })
    expect(result).toContain('Author: Артём Сёмкин')
  })
})

describe('buildReadmeBlock', () => {
  it('serializes a titled readme block', () => {
    const result = buildReadmeBlock('Velum', {
      'Contributors': 'artemsemkin',
      'Stable tag': '2.0.0',
    })

    expect(result).toBe('=== Velum ===\n\nContributors: artemsemkin\nStable tag: 2.0.0\n\n')
  })

  it('preserves iteration order', () => {
    const result = buildReadmeBlock('Test', {
      'Contributors': 'user',
      'Tags': 'a, b',
      'Stable tag': '1.0.0',
      'License': 'GPL',
    })

    const lines = result.split('\n').filter((l) => l.includes(':'))
    const fieldOrder = lines.map((l) => l.split(':')[0].trim())

    expect(fieldOrder).toEqual(['Contributors', 'Tags', 'Stable tag', 'License'])
  })
})

describe('replaceComment', () => {
  it('replaces standard /* ... */ header', () => {
    const content = `<?php\n/*\nPlugin Name: Old Name\nVersion: 1.0.0\n*/\n\nnamespace MyPlugin;\n\nclass Main {}\n`
    const newComment = `/*\nPlugin Name: New Name\nVersion: 2.0.0\n*/\n`
    const result = replaceComment(content, newComment)

    expect(result).toContain('Plugin Name: New Name')
    expect(result).toContain('Version: 2.0.0')
    expect(result).toContain('namespace MyPlugin;')
    expect(result).toContain('class Main {}')
    expect(result).not.toContain('Old Name')
  })

  it('replaces /** ... */ docblock style header', () => {
    const content = `<?php\n/**\n * Plugin Name: Old Name\n * Version: 1.0.0\n */\n\nfunction init() {}\n`
    const newComment = `/*\nPlugin Name: New Name\nVersion: 2.0.0\n*/\n`
    const result = replaceComment(content, newComment)

    expect(result).toContain('Plugin Name: New Name')
    expect(result).toContain('function init() {}')
    expect(result).not.toContain('Old Name')
  })

  it('preserves code after header with blank lines', () => {
    const content = `<?php\n/*\nPlugin Name: Test\n*/\n\n\n\n// Important code\n$x = 1;\n`
    const result = replaceComment(content, '/*\nNew\n*/\n')

    expect(result).toContain('// Important code')
    expect(result).toContain('$x = 1;')
  })

  it('returns null when no opening /* found', () => {
    const content = `<?php\necho "hello";\n`
    expect(replaceComment(content, '/*\nNew\n*/\n')).toBeNull()
  })

  it('returns null when no closing */ found', () => {
    const content = `<?php\n/* This comment is never closed\necho "hello";\n`
    expect(replaceComment(content, '/*\nNew\n*/\n')).toBeNull()
  })

  it('handles file where */ appears at very end', () => {
    const content = `<?php\n/*\nPlugin Name: Test\n*/`
    const result = replaceComment(content, '/*\nNew\n*/\n')

    expect(result).toContain('New')
  })

  it('preserves content before the comment', () => {
    const content = `<?php\n/*\nOld\n*/\ncode();\n`
    const result = replaceComment(content, '/*\nNew\n*/\n')

    expect(result!.startsWith('<?php\n')).toBe(true)
    expect(result).toContain('code();')
  })

  it('is idempotent — repeated replacements do not add extra blank lines', () => {
    const original = `<?php\n/*\nPlugin Name: Test\nVersion: 1.0.0\n*/\n\nif ( true ) {}\n`
    const comment = `/*\nPlugin Name: Test\nVersion: 2.0.0\n*/\n`

    const first = replaceComment(original, comment)!
    const second = replaceComment(first, comment)!
    const third = replaceComment(second, comment)!

    expect(second).toBe(first)
    expect(third).toBe(first)
  })
})

describe('replaceReadmeBlock', () => {
  it('replaces header and preserves short description and sections', () => {
    const content = `=== Old Name ===\nContributors: olduser\nRequires at least: 6.0\nStable tag: 1.0.0\n\nA short description of the plugin.\n\n== Description ==\n\nLong description here.\n\n== Changelog ==\n\n= 1.0.0 =\n* Initial release\n`
    const newBlock = `=== New Name ===\n\nContributors: newuser\nRequires at least: 6.5\nStable tag: 2.0.0\n\n`
    const result = replaceReadmeBlock(content, newBlock)

    expect(result).toContain('=== New Name ===')
    expect(result).toContain('Contributors: newuser')
    expect(result).toContain('Stable tag: 2.0.0')
    expect(result).toContain('A short description of the plugin.')
    expect(result).toContain('== Description ==')
    expect(result).toContain('== Changelog ==')
    expect(result).not.toContain('Old Name')
    expect(result).not.toContain('olduser')
  })

  it('handles no short description (section immediately after header)', () => {
    const content = `=== My Plugin ===\nStable tag: 1.0.0\n\n== Description ==\n\nContent here.\n`
    const newBlock = `=== My Plugin ===\n\nStable tag: 2.0.0\n\n`
    const result = replaceReadmeBlock(content, newBlock)

    expect(result).toContain('Stable tag: 2.0.0')
    expect(result).toContain('== Description ==')
  })

  it('handles header-only file with no sections below', () => {
    const content = `=== My Theme ===\nContributors: user\nStable tag: 1.0.0\n`
    const newBlock = `=== My Theme ===\n\nContributors: newuser\nStable tag: 2.0.0\n\n`
    const result = replaceReadmeBlock(content, newBlock)

    expect(result).toContain('Contributors: newuser')
    expect(result).toContain('Stable tag: 2.0.0')
  })

  it('returns null when no title line found', () => {
    const content = `This is just some random text\nwithout any readme title.\n`
    expect(replaceReadmeBlock(content, '=== Test ===\n\n')).toBeNull()
  })

  it('handles extra blank lines between header and content', () => {
    const content = `=== My Plugin ===\nStable tag: 1.0.0\n\n\n\nA short description.\n\n== Description ==\n\nContent.\n`
    const newBlock = `=== My Plugin ===\n\nStable tag: 2.0.0\n\n`
    const result = replaceReadmeBlock(content, newBlock)

    expect(result).toContain('Stable tag: 2.0.0')
    expect(result).toContain('A short description.')
  })

  it('preserves trailing newline', () => {
    const content = `=== Test ===\nStable tag: 1.0.0\n\nSome text.\n`
    const newBlock = `=== Test ===\n\nStable tag: 2.0.0\n\n`
    const result = replaceReadmeBlock(content, newBlock)

    expect(result).toMatch(/\n$/)
  })

  it('handles real-world plugin readme with many sections', () => {
    const content = `=== Fluid Design System for Elementor ===\nContributors: artemsemkin\nDonate link: https://example.com\nTags: elementor, design\nRequires at least: 6.5\nTested up to: 6.9\nRequires PHP: 8.0\nStable tag: 1.5.0\nLicense: GPLv2 or later\nLicense URI: http://www.gnu.org/licenses/gpl-2.0.html\n\nFluid responsive design system for Elementor page builder.\n\n== Description ==\n\nThis plugin provides a comprehensive fluid design system.\n\n= Features =\n\n* Feature one\n* Feature two\n\n== Installation ==\n\n1. Upload the plugin\n2. Activate it\n\n== Frequently Asked Questions ==\n\n= How do I use this? =\n\nJust install and activate.\n\n== Screenshots ==\n\n1. Screenshot description\n\n== Changelog ==\n\n= 1.5.0 =\n* New feature\n\n= 1.0.0 =\n* Initial release\n\n== Upgrade Notice ==\n\n= 1.5.0 =\nUpgrade for new features.\n`
    const newBlock = `=== Fluid Design System for Elementor ===\n\nContributors: artemsemkin\nDonate link: https://example.com\nTags: elementor, design, fluid\nRequires at least: 6.7\nTested up to: 6.9\nRequires PHP: 8.2\nStable tag: 2.0.0\nLicense: GPLv2 or later\nLicense URI: http://www.gnu.org/licenses/gpl-2.0.html\n\n`
    const result = replaceReadmeBlock(content, newBlock)

    expect(result).toContain('Stable tag: 2.0.0')
    expect(result).toContain('Requires PHP: 8.2')
    expect(result).toContain('Tags: elementor, design, fluid')
    expect(result).toContain('Fluid responsive design system')
    expect(result).toContain('== Description ==')
    expect(result).toContain('== Installation ==')
    expect(result).toContain('== Frequently Asked Questions ==')
    expect(result).toContain('== Changelog ==')
    expect(result).toContain('== Upgrade Notice ==')
    expect(result).not.toContain('Requires at least: 6.5')
    expect(result).not.toContain('Requires PHP: 8.0')
    expect(result).not.toContain('Stable tag: 1.5.0')
  })
})
