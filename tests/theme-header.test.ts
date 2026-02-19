import { describe, it, expect } from 'vitest'
import { buildThemeHeader } from '../src/theme-header'

describe('buildThemeHeader', () => {
  it('produces complete header with all fields', () => {
    const result = buildThemeHeader({
      pkg: {
        name: '@arts/velum-theme',
        version: '2.1.0',
        wp: {
          theme: {
            uri: 'https://example.com',
            description: 'A theme',
            author: 'Artem',
            authorUri: 'https://artemsemkin.com',
            license: 'GPL-2.0',
            licenseUri: 'https://www.gnu.org/licenses/gpl-2.0.html',
            requiresAtLeast: '6.5',
            requiresPHP: '8.0',
            testedUpTo: '6.9',
            tags: 'blog, portfolio',
            template: 'parent-theme',
            domainPath: '/languages',
            updateUri: 'https://example.com/update',
          },
        },
      },
      slug: 'velum',
    })

    expect(result).toContain('Theme Name: Velum')
    expect(result).toContain('Theme URI: https://example.com')
    expect(result).toContain('Description: A theme')
    expect(result).toContain('Version: 2.1.0')
    expect(result).toContain('Author: Artem')
    expect(result).toContain('Author URI: https://artemsemkin.com')
    expect(result).toContain('License: GPL-2.0')
    expect(result).toContain('License URI: https://www.gnu.org/licenses/gpl-2.0.html')
    expect(result).toContain('Requires at least: 6.5')
    expect(result).toContain('Requires PHP: 8.0')
    expect(result).toContain('Tested up to: 6.9')
    expect(result).toContain('Tags: blog, portfolio')
    expect(result).toContain('Template: parent-theme')
    expect(result).toContain('Text Domain: velum')
    expect(result).toContain('Domain Path: /languages')
    expect(result).toContain('Update URI: https://example.com/update')
    expect(result).toMatch(/^\/\*\n/)
    expect(result).toMatch(/\*\/\n$/)
  })

  it('produces minimal header with only name and version', () => {
    const result = buildThemeHeader({
      pkg: { name: '@arts/velum-theme', version: '1.0.0', wp: { theme: {} } },
      slug: 'velum',
    })

    expect(result).toContain('Theme Name: Velum')
    expect(result).toContain('Version: 1.0.0')
    expect(result).toContain('Text Domain: velum')
    expect(result).not.toContain('Theme URI:')
    expect(result).not.toContain('Description:')
    expect(result).not.toContain('Author:')
    expect(result).not.toContain('Tags:')
  })

  it('falls back to 1.0.0 when pkg.version is missing', () => {
    const result = buildThemeHeader({
      pkg: { name: '@arts/test-theme', wp: { theme: {} } },
      slug: 'test',
    })

    expect(result).toContain('Version: 1.0.0')
  })

  it('derives theme name from slug when pkg.name is missing', () => {
    const result = buildThemeHeader({
      pkg: { version: '1.0.0', wp: { theme: {} } },
      slug: 'my-cool-theme',
    })

    expect(result).toContain('Theme Name: My Cool Theme')
  })

  it('strips @scope/ prefix and -theme suffix from pkg.name', () => {
    const result = buildThemeHeader({
      pkg: { name: '@arts/velum-theme', version: '1.0.0', wp: { theme: {} } },
      slug: 'velum',
    })

    expect(result).toContain('Theme Name: Velum')
  })

  it('handles special characters in values', () => {
    const result = buildThemeHeader({
      pkg: {
        name: '@arts/test-theme',
        version: '1.0.0',
        wp: {
          theme: {
            description: 'Quotes "here" & ampersands <there>',
            author: "O'Brien & Co.",
          },
        },
      },
      slug: 'test',
    })

    expect(result).toContain('Quotes "here" & ampersands <there>')
    expect(result).toContain("O'Brien & Co.")
  })

  it('handles unicode in values', () => {
    const result = buildThemeHeader({
      pkg: {
        name: '@arts/test-theme',
        version: '1.0.0',
        wp: { theme: { author: 'Артём Сёмкин' } },
      },
      slug: 'test',
    })

    expect(result).toContain('Author: Артём Сёмкин')
  })

  it('omits empty string optional fields', () => {
    const result = buildThemeHeader({
      pkg: {
        name: '@arts/test-theme',
        version: '1.0.0',
        wp: {
          theme: {
            uri: '',
            description: '',
            tags: '',
          },
        },
      },
      slug: 'test',
    })

    expect(result).not.toContain('Theme URI:')
    expect(result).not.toContain('Description:')
    expect(result).not.toContain('Tags:')
  })

  it('uses textDomain override when provided', () => {
    const result = buildThemeHeader({
      pkg: {
        name: '@arts/test-theme',
        version: '1.0.0',
        wp: { theme: { textDomain: 'custom-domain' } },
      },
      slug: 'test',
    })

    expect(result).toContain('Text Domain: custom-domain')
  })

  it('respects field order per WP conventions', () => {
    const result = buildThemeHeader({
      pkg: {
        name: '@arts/velum-theme',
        version: '1.0.0',
        wp: {
          theme: {
            uri: 'https://example.com',
            description: 'Desc',
            author: 'Author',
            authorUri: 'https://author.com',
            license: 'GPL',
            licenseUri: 'https://gpl.org',
            requiresAtLeast: '6.5',
            requiresPHP: '8.0',
            testedUpTo: '6.9',
            tags: 'tag1',
            template: 'parent',
            domainPath: '/lang',
            updateUri: 'https://update.com',
          },
        },
      },
      slug: 'velum',
    })

    const lines = result.split('\n')
    const fieldOrder = lines
      .filter((l) => l.includes(':'))
      .map((l) => l.split(':')[0].trim())

    expect(fieldOrder).toEqual([
      'Theme Name',
      'Theme URI',
      'Description',
      'Version',
      'Author',
      'Author URI',
      'License',
      'License URI',
      'Requires at least',
      'Requires PHP',
      'Tested up to',
      'Tags',
      'Template',
      'Text Domain',
      'Domain Path',
      'Update URI',
    ])
  })
})
