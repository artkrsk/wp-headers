import { describe, it, expect } from 'vitest'
import { buildPluginHeader } from '../src/plugin-header'

describe('buildPluginHeader', () => {
  it('produces complete header with all fields', () => {
    const result = buildPluginHeader({
      pkg: {
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
      },
      slug: 'velum-core',
    })

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
    const result = buildPluginHeader({
      pkg: { version: '1.0.0', wp: { plugin: {} } },
      slug: 'my-plugin',
    })

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
    const result = buildPluginHeader({
      pkg: { wp: { plugin: {} } },
      slug: 'test',
    })

    expect(result).toContain('Version: 1.0.0')
  })

  it('uses plugin.name over slug-derived name', () => {
    const result = buildPluginHeader({
      pkg: {
        version: '1.0.0',
        wp: { plugin: { name: 'Custom Name Here' } },
      },
      slug: 'some-slug',
    })

    expect(result).toContain('Plugin Name: Custom Name Here')
  })

  it('derives plugin name from slug when plugin.name is missing', () => {
    const result = buildPluginHeader({
      pkg: { version: '1.0.0', wp: { plugin: {} } },
      slug: 'velum-elementor',
    })

    expect(result).toContain('Plugin Name: Velum Elementor')
  })

  it('omits empty string optional fields', () => {
    const result = buildPluginHeader({
      pkg: {
        version: '1.0.0',
        wp: {
          plugin: {
            pluginUri: '',
            description: '',
            license: '',
          },
        },
      },
      slug: 'test',
    })

    expect(result).not.toContain('Plugin URI:')
    expect(result).not.toContain('Description:')
    expect(result).not.toContain('License:')
  })

  it('uses textDomain override when provided', () => {
    const result = buildPluginHeader({
      pkg: {
        version: '1.0.0',
        wp: { plugin: { textDomain: 'custom-domain' } },
      },
      slug: 'test',
    })

    expect(result).toContain('Text Domain: custom-domain')
  })

  it('respects field order per WP conventions', () => {
    const result = buildPluginHeader({
      pkg: {
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
      },
      slug: 'test',
    })

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
