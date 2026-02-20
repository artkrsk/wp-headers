import { describe, it, expect } from 'vitest'
import { buildComment, buildReadmeBlock } from '../src/core'
import { wpPluginHeader, wpPluginReadme, pluginHeaderFromPkg, pluginReadmeFromPkg } from '../src/wp-plugin'

describe('wpPluginHeader + buildComment (plugin PHP header)', () => {
  it('produces complete header with all fields', () => {
    const config = pluginHeaderFromPkg({
      name: '@arts/velum-core-plugin',
      version: '2.0.0',
      wp: {
        plugin: {
          name: 'Velum Core',
          pluginUri: 'https://example.com',
          description: 'Core plugin.',
          author: 'Artem',
          authorUri: 'https://artemsemkin.com',
          license: 'GPL-2.0',
          licenseUri: 'https://www.gnu.org/licenses/gpl-2.0.html',
          requiresAtLeast: '6.5',
          requiresPHP: '8.0',
          testedUpTo: '6.9',
          updateUri: 'https://example.com/update',
          domainPath: '/languages',
          network: 'true',
          requiresPlugins: 'elementor,woocommerce',
        },
      },
    }, 'velum-core')

    const result = buildComment(wpPluginHeader(config))

    expect(result).toContain('Plugin Name: Velum Core')
    expect(result).toContain('Plugin URI: https://example.com')
    expect(result).toContain('Description: Core plugin.')
    expect(result).toContain('Version: 2.0.0')
    expect(result).toContain('Author: Artem')
    expect(result).toContain('Author URI: https://artemsemkin.com')
    expect(result).toContain('License: GPL-2.0')
    expect(result).toContain('License URI: https://www.gnu.org/licenses/gpl-2.0.html')
    expect(result).toContain('Requires at least: 6.5')
    expect(result).toContain('Requires PHP: 8.0')
    expect(result).toContain('Tested up to: 6.9')
    expect(result).toContain('Update URI: https://example.com/update')
    expect(result).toContain('Text Domain: velum-core')
    expect(result).toContain('Domain Path: /languages')
    expect(result).toContain('Network: true')
    expect(result).toContain('Requires Plugins: elementor,woocommerce')
  })

  it('produces minimal header with only name and version', () => {
    const config = pluginHeaderFromPkg(
      { version: '1.0.0', wp: { plugin: {} } },
      'my-plugin',
    )
    const result = buildComment(wpPluginHeader(config))

    expect(result).toContain('Plugin Name: My Plugin')
    expect(result).toContain('Version: 1.0.0')
    expect(result).toContain('Text Domain: my-plugin')
    expect(result).not.toContain('Plugin URI:')
    expect(result).not.toContain('Description:')
    expect(result).not.toContain('License:')
    expect(result).not.toContain('Network:')
    expect(result).not.toContain('Requires Plugins:')
  })

  it('falls back to 1.0.0 when pkg.version is missing', () => {
    const config = pluginHeaderFromPkg(
      { wp: { plugin: {} } },
      'test',
    )
    const result = buildComment(wpPluginHeader(config))

    expect(result).toContain('Version: 1.0.0')
  })

  it('uses plugin.name over slug-derived name', () => {
    const config = pluginHeaderFromPkg({
      version: '1.0.0',
      wp: { plugin: { name: 'Custom Name Here' } },
    }, 'some-slug')
    const result = buildComment(wpPluginHeader(config))

    expect(result).toContain('Plugin Name: Custom Name Here')
  })

  it('derives plugin name from slug when plugin.name is missing', () => {
    const config = pluginHeaderFromPkg(
      { version: '1.0.0', wp: { plugin: {} } },
      'velum-elementor',
    )
    const result = buildComment(wpPluginHeader(config))

    expect(result).toContain('Plugin Name: Velum Elementor')
  })

  it('omits empty string optional fields', () => {
    const config = pluginHeaderFromPkg({
      version: '1.0.0',
      wp: { plugin: { pluginUri: '', description: '', license: '' } },
    }, 'test')
    const result = buildComment(wpPluginHeader(config))

    expect(result).not.toContain('Plugin URI:')
    expect(result).not.toContain('Description:')
    expect(result).not.toContain('License:')
  })

  it('uses textDomain override when provided', () => {
    const config = pluginHeaderFromPkg({
      version: '1.0.0',
      wp: { plugin: { textDomain: 'custom-domain' } },
    }, 'test')
    const result = buildComment(wpPluginHeader(config))

    expect(result).toContain('Text Domain: custom-domain')
  })

  it('falls back to empty plugin fields when wp key is missing', () => {
    const config = pluginHeaderFromPkg({ version: '1.0.0' }, 'my-plugin')
    const result = buildComment(wpPluginHeader(config))

    expect(result).toContain('Plugin Name: My Plugin')
    expect(result).toContain('Version: 1.0.0')
    expect(result).toContain('Text Domain: my-plugin')
    expect(result).not.toContain('Plugin URI:')
  })

  it('respects field order per WP conventions', () => {
    const config = pluginHeaderFromPkg({
      version: '1.0.0',
      wp: {
        plugin: {
          name: 'Test',
          pluginUri: 'https://example.com',
          description: 'Desc',
          author: 'Author',
          authorUri: 'https://author.com',
          license: 'GPL',
          licenseUri: 'https://gpl.org',
          requiresAtLeast: '6.5',
          requiresPHP: '8.0',
          testedUpTo: '6.9',
          updateUri: 'https://update.com',
          domainPath: '/lang',
          network: 'true',
          requiresPlugins: 'elementor',
        },
      },
    }, 'test')
    const result = buildComment(wpPluginHeader(config))

    const lines = result.split('\n')
    const fieldOrder = lines
      .filter((l) => l.includes(':'))
      .map((l) => l.split(':')[0].trim())

    expect(fieldOrder).toEqual([
      'Plugin Name',
      'Plugin URI',
      'Description',
      'Version',
      'Author',
      'Author URI',
      'License',
      'License URI',
      'Requires at least',
      'Requires PHP',
      'Tested up to',
      'Update URI',
      'Text Domain',
      'Domain Path',
      'Network',
      'Requires Plugins',
    ])
  })
})

describe('wpPluginReadme + buildReadmeBlock (readme.txt header)', () => {
  it('produces plugin header with all fields including donate link and tags', () => {
    const config = pluginReadmeFromPkg({
      name: '@arts/fluid-design-system',
      version: '1.5.0',
      wp: {
        plugin: {
          name: 'Fluid Design System for Elementor',
          contributors: 'artemsemkin',
          donateLink: 'https://example.com/donate',
          tags: 'elementor, design system, fluid',
          requiresAtLeast: '6.5',
          testedUpTo: '6.9',
          requiresPHP: '8.0',
          license: 'GPLv2 or later',
          licenseUri: 'http://www.gnu.org/licenses/gpl-2.0.html',
        },
      },
    }, 'fluid-design-system')
    const result = buildReadmeBlock(config.name, wpPluginReadme(config))

    expect(result).toContain('=== Fluid Design System for Elementor ===')
    expect(result).toContain('Contributors: artemsemkin')
    expect(result).toContain('Donate link: https://example.com/donate')
    expect(result).toContain('Tags: elementor, design system, fluid')
    expect(result).toContain('Requires at least: 6.5')
    expect(result).toContain('Tested up to: 6.9')
    expect(result).toContain('Requires PHP: 8.0')
    expect(result).toContain('Stable tag: 1.5.0')
    expect(result).toContain('License: GPLv2 or later')
    expect(result).toContain('License URI: http://www.gnu.org/licenses/gpl-2.0.html')
  })

  it('derives name from pkg.name stripping -plugin suffix', () => {
    const config = pluginReadmeFromPkg(
      { name: '@arts/my-cool-plugin', version: '1.0.0', wp: { plugin: {} } },
      'my-cool-plugin',
    )
    // Plugin readme uses plugin.name field, which falls back to titleCase(slug)
    const result = buildReadmeBlock(config.name, wpPluginReadme(config))

    expect(result).toContain('=== My Cool Plugin ===')
  })

  it('uses plugin.name field when set for plugins', () => {
    const config = pluginReadmeFromPkg({
      name: '@arts/fluid-design-system',
      version: '1.0.0',
      wp: { plugin: { name: 'Fluid Design System for Elementor' } },
    }, 'fluid-design-system')
    const result = buildReadmeBlock(config.name, wpPluginReadme(config))

    expect(result).toContain('=== Fluid Design System for Elementor ===')
  })

  it('respects field order for plugins', () => {
    const config = pluginReadmeFromPkg({
      name: '@arts/test-plugin',
      version: '1.0.0',
      wp: {
        plugin: {
          contributors: 'user',
          donateLink: 'https://donate.com',
          tags: 'tag1, tag2',
          requiresAtLeast: '6.5',
          testedUpTo: '6.9',
          requiresPHP: '8.0',
          license: 'GPL',
          licenseUri: 'https://gpl.org',
        },
      },
    }, 'test')
    const result = buildReadmeBlock(config.name, wpPluginReadme(config))

    const lines = result.split('\n').filter((l) => l.includes(':'))
    const fieldOrder = lines.map((l) => l.split(':')[0].trim())

    expect(fieldOrder).toEqual([
      'Contributors',
      'Donate link',
      'Tags',
      'Requires at least',
      'Tested up to',
      'Requires PHP',
      'Stable tag',
      'License',
      'License URI',
    ])
  })

  it('defaults version to 1.0.0 when missing', () => {
    const config = pluginReadmeFromPkg(
      { name: '@arts/test-plugin', wp: { plugin: {} } },
      'test',
    )
    const result = buildReadmeBlock(config.name, wpPluginReadme(config))

    expect(result).toContain('Stable tag: 1.0.0')
  })
})
