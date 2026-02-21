import { describe, it, expect } from 'vitest'
import { buildComment, buildReadmeBlock } from '../src/core'
import { wpThemeStyle, wpThemeReadme, themeStyleFromPkg, themeReadmeFromPkg } from '../src/wp-theme'

describe('wpThemeStyle + buildComment (style.css header)', () => {
  it('produces complete header with all fields', () => {
    const config = themeStyleFromPkg({
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
    }, 'velum')

    const result = buildComment(wpThemeStyle(config))

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
    const config = themeStyleFromPkg(
      { name: '@arts/velum-theme', version: '1.0.0', wp: { theme: {} } },
      'velum',
    )
    const result = buildComment(wpThemeStyle(config))

    expect(result).toContain('Theme Name: Velum')
    expect(result).toContain('Version: 1.0.0')
    expect(result).toContain('Text Domain: velum')
    expect(result).not.toContain('Theme URI:')
    expect(result).not.toContain('Description:')
    expect(result).not.toContain('Author:')
    expect(result).not.toContain('Tags:')
  })

  it('falls back to 1.0.0 when pkg.version is missing', () => {
    const config = themeStyleFromPkg(
      { name: '@arts/test-theme', wp: { theme: {} } },
      'test',
    )
    const result = buildComment(wpThemeStyle(config))

    expect(result).toContain('Version: 1.0.0')
  })

  it('derives theme name from slug when pkg.name is missing', () => {
    const config = themeStyleFromPkg(
      { version: '1.0.0', wp: { theme: {} } },
      'my-cool-theme',
    )
    const result = buildComment(wpThemeStyle(config))

    expect(result).toContain('Theme Name: My Cool Theme')
  })

  it('strips @scope/ prefix and -theme suffix from pkg.name', () => {
    const config = themeStyleFromPkg(
      { name: '@arts/velum-theme', version: '1.0.0', wp: { theme: {} } },
      'velum',
    )
    const result = buildComment(wpThemeStyle(config))

    expect(result).toContain('Theme Name: Velum')
  })

  it('omits empty string optional fields', () => {
    const config = themeStyleFromPkg({
      name: '@arts/test-theme',
      version: '1.0.0',
      wp: { theme: { uri: '', description: '', tags: '' } },
    }, 'test')
    const result = buildComment(wpThemeStyle(config))

    expect(result).not.toContain('Theme URI:')
    expect(result).not.toContain('Description:')
    expect(result).not.toContain('Tags:')
  })

  it('uses textDomain override when provided', () => {
    const config = themeStyleFromPkg({
      name: '@arts/test-theme',
      version: '1.0.0',
      wp: { theme: { textDomain: 'custom-domain' } },
    }, 'test')
    const result = buildComment(wpThemeStyle(config))

    expect(result).toContain('Text Domain: custom-domain')
  })

  it('falls back to empty theme fields when wp key is missing', () => {
    const config = themeStyleFromPkg({ version: '1.0.0' }, 'my-theme')
    const result = buildComment(wpThemeStyle(config))

    expect(result).toContain('Theme Name: My Theme')
    expect(result).toContain('Version: 1.0.0')
    expect(result).toContain('Text Domain: my-theme')
    expect(result).not.toContain('Theme URI:')
  })

  it('respects field order per WP conventions', () => {
    const config = themeStyleFromPkg({
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
    }, 'velum')
    const result = buildComment(wpThemeStyle(config))

    const lines = result.split('\n')
    const fieldOrder = lines
      .filter((l) => l.includes(':'))
      .map((l) => l.split(':')[0].replace(/^\s*\*\s*/, '').trim())

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

describe('wpThemeReadme + buildReadmeBlock (readme.txt header)', () => {
  it('produces theme header with all fields', () => {
    const config = themeReadmeFromPkg({
      name: '@arts/velum-theme',
      version: '2.1.0',
      wp: {
        theme: {
          contributors: 'artemsemkin',
          author: 'Artem Semkin',
          requiresAtLeast: '6.5',
          testedUpTo: '6.9',
          requiresPHP: '8.0',
          license: 'GPLv2 or later',
          licenseUri: 'http://www.gnu.org/licenses/gpl-2.0.html',
        },
      },
    }, 'velum')
    const result = buildReadmeBlock(config.name, wpThemeReadme(config))

    expect(result).toContain('=== Velum ===')
    expect(result).toContain('Contributors: artemsemkin')
    expect(result).toContain('Requires at least: 6.5')
    expect(result).toContain('Tested up to: 6.9')
    expect(result).toContain('Requires PHP: 8.0')
    expect(result).toContain('Stable tag: 2.1.0')
    expect(result).toContain('License: GPLv2 or later')
    expect(result).toContain('License URI: http://www.gnu.org/licenses/gpl-2.0.html')
  })

  it('produces minimal header with only name and version', () => {
    const config = themeReadmeFromPkg(
      { name: '@arts/velum-theme', version: '1.0.0', wp: { theme: {} } },
      'velum',
    )
    const result = buildReadmeBlock(config.name, wpThemeReadme(config))

    expect(result).toContain('=== Velum ===')
    expect(result).toContain('Stable tag: 1.0.0')
    expect(result).not.toContain('Contributors:')
    expect(result).not.toContain('Requires at least:')
    expect(result).not.toContain('License:')
  })

  it('falls back to author when contributors is not set', () => {
    const config = themeReadmeFromPkg({
      name: '@arts/velum-theme',
      version: '1.0.0',
      wp: { theme: { author: 'Artem Semkin' } },
    }, 'velum')
    const result = buildReadmeBlock(config.name, wpThemeReadme(config))

    expect(result).toContain('Contributors: Artem Semkin')
  })

  it('prefers contributors over author', () => {
    const config = themeReadmeFromPkg({
      name: '@arts/velum-theme',
      version: '1.0.0',
      wp: { theme: { contributors: 'artemsemkin', author: 'Artem Semkin' } },
    }, 'velum')
    const result = buildReadmeBlock(config.name, wpThemeReadme(config))

    expect(result).toContain('Contributors: artemsemkin')
    expect(result).not.toContain('Artem Semkin')
  })

  it('derives name from pkg.name stripping scope and -theme suffix', () => {
    const config = themeReadmeFromPkg(
      { name: '@arts/my-cool-theme', version: '1.0.0', wp: { theme: {} } },
      'my-cool-theme',
    )
    const result = buildReadmeBlock(config.name, wpThemeReadme(config))

    expect(result).toContain('=== My Cool ===')
  })

  it('falls back to slug when pkg.name is missing', () => {
    const config = themeReadmeFromPkg(
      { version: '1.0.0', wp: { theme: {} } },
      'my-cool-theme',
    )
    const result = buildReadmeBlock(config.name, wpThemeReadme(config))

    expect(result).toContain('=== My Cool Theme ===')
  })

  it('respects field order for themes', () => {
    const config = themeReadmeFromPkg({
      name: '@arts/velum-theme',
      version: '1.0.0',
      wp: {
        theme: {
          contributors: 'user',
          requiresAtLeast: '6.5',
          testedUpTo: '6.9',
          requiresPHP: '8.0',
          license: 'GPL',
          licenseUri: 'https://gpl.org',
        },
      },
    }, 'velum')
    const result = buildReadmeBlock(config.name, wpThemeReadme(config))

    const lines = result.split('\n').filter((l) => l.includes(':'))
    const fieldOrder = lines.map((l) => l.split(':')[0].trim())

    expect(fieldOrder).toEqual([
      'Contributors',
      'Requires at least',
      'Tested up to',
      'Requires PHP',
      'Stable tag',
      'License',
      'License URI',
    ])
  })

  it('defaults version to 1.0.0 when missing', () => {
    const config = themeReadmeFromPkg(
      { name: '@arts/velum-theme', wp: { theme: {} } },
      'velum',
    )
    const result = buildReadmeBlock(config.name, wpThemeReadme(config))

    expect(result).toContain('Stable tag: 1.0.0')
  })
})
