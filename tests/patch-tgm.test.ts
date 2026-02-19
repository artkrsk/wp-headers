import { describe, it, expect } from 'vitest'
import { patchTgmVersion } from '../src/patch-tgm'

describe('patchTgmVersion', () => {
  // ── Real-world format (Velum) ────────────────────────────────────────

  it('handles array() long syntax with aligned =>', () => {
    const content = `$plugins = array(
			array(
				'name'     => esc_html_x( 'Velum Core', 'Required plugin name', 'velum' ),
				'slug'     => 'velum-core',
				'source'   => esc_url( $core_plugin_url ),
				'required' => true,
				'version'  => '1.0.0',
			),
		);`

    const result = patchTgmVersion(content, 'velum-core', '2.0.0')

    expect(result).toContain("'version'  => '2.0.0'")
    expect(result).toContain("'slug'     => 'velum-core'")
  })

  // ── Short array syntax ───────────────────────────────────────────────

  it('handles [] short array syntax', () => {
    const content = `$plugins = [
  [
    'slug' => 'my-plugin',
    'version' => '1.0.0',
  ],
];`

    const result = patchTgmVersion(content, 'my-plugin', '3.0.0')

    expect(result).toContain("'version' => '3.0.0'")
  })

  // ── Quote styles ─────────────────────────────────────────────────────

  it('handles double-quoted slug', () => {
    const content = `array(
  "slug" => "my-plugin",
  "version" => "1.0.0",
)`

    const result = patchTgmVersion(content, 'my-plugin', '2.0.0')

    expect(result).toContain('"version" => "2.0.0"')
  })

  it('handles mixed quotes (single slug, double version)', () => {
    const content = `array(
  'slug' => 'my-plugin',
  "version" => "1.0.0",
)`

    const result = patchTgmVersion(content, 'my-plugin', '2.0.0')

    expect(result).toContain('"version" => "2.0.0"')
  })

  it('preserves original quote style of version value', () => {
    const content = `array(
  'slug' => 'my-plugin',
  "version" => "1.0.0",
)`

    const result = patchTgmVersion(content, 'my-plugin', '2.0.0')

    // Should use double quotes because original used double quotes
    expect(result).toContain('"version" => "2.0.0"')
    expect(result).not.toContain("'version' => '2.0.0'")
  })

  // ── Field ordering ───────────────────────────────────────────────────

  it('handles version before slug (reversed field order)', () => {
    const content = `array(
  'version' => '1.0.0',
  'slug' => 'my-plugin',
  'name' => 'My Plugin',
)`

    const result = patchTgmVersion(content, 'my-plugin', '5.0.0')

    expect(result).toContain("'version' => '5.0.0'")
  })

  // ── No-op cases ──────────────────────────────────────────────────────

  it('returns content unchanged when no version field exists', () => {
    const content = `array(
  'slug' => 'my-plugin',
  'name' => 'My Plugin',
  'required' => true,
)`

    const result = patchTgmVersion(content, 'my-plugin', '2.0.0')

    expect(result).toBe(content)
  })

  it('returns content unchanged when slug not found', () => {
    const content = `array(
  'slug' => 'other-plugin',
  'version' => '1.0.0',
)`

    const result = patchTgmVersion(content, 'my-plugin', '2.0.0')

    expect(result).toBe(content)
  })

  it('returns content unchanged when version already matches', () => {
    const content = `array(
  'slug' => 'my-plugin',
  'version' => '2.0.0',
)`

    const result = patchTgmVersion(content, 'my-plugin', '2.0.0')

    expect(result).toBe(content)
  })

  it('returns empty string unchanged', () => {
    expect(patchTgmVersion('', 'my-plugin', '2.0.0')).toBe('')
  })

  it('returns content unchanged when no arrays present', () => {
    const content = `<?php echo "hello";`

    expect(patchTgmVersion(content, 'my-plugin', '2.0.0')).toBe(content)
  })

  // ── Whitespace extremes ──────────────────────────────────────────────

  it('handles extreme whitespace: tabs, spaces, blank lines between fields', () => {
    const content = `array(

				'slug'			=>		'my-plugin',

				'version'		=>		'1.0.0',

			)`

    const result = patchTgmVersion(content, 'my-plugin', '9.9.9')

    expect(result).toContain("'version'\t\t=>\t\t'9.9.9'")
  })

  it('preserves whitespace alignment around =>', () => {
    const content = `array(
				'slug'     => 'my-plugin',
				'version'  => '1.0.0',
			)`

    const result = patchTgmVersion(content, 'my-plugin', '3.0.0')

    // The whitespace around => should be preserved
    expect(result).toContain("'version'  => '3.0.0'")
  })

  // ── Nested function calls ────────────────────────────────────────────

  it('handles nested function calls with parens: esc_html_x(...)', () => {
    const content = `array(
				'name'     => esc_html_x( 'Velum Core', 'Required plugin name', 'velum' ),
				'slug'     => 'velum-core',
				'source'   => esc_url( $core_plugin_url ),
				'required' => true,
				'version'  => '1.0.0',
			)`

    const result = patchTgmVersion(content, 'velum-core', '2.5.0')

    expect(result).toContain("'version'  => '2.5.0'")
    // Nested calls should be preserved
    expect(result).toContain("esc_html_x( 'Velum Core', 'Required plugin name', 'velum' )")
    expect(result).toContain('esc_url( $core_plugin_url )')
  })

  // ── Multiple plugins ─────────────────────────────────────────────────

  it('only patches matching slug, leaves others intact', () => {
    const content = `$plugins = array(
			array(
				'slug'     => 'velum-core',
				'version'  => '1.0.0',
			),
			array(
				'slug'     => 'velum-elementor',
				'version'  => '1.0.0',
			),
		);`

    const result = patchTgmVersion(content, 'velum-core', '2.0.0')

    expect(result).toContain("'slug'     => 'velum-core'")
    expect(result).toContain("'slug'     => 'velum-elementor'")
    // Only velum-core's version should change
    // Count occurrences
    const versionMatches = result.match(/'version'\s*=>\s*'[^']*'/g)
    expect(versionMatches).toHaveLength(2)
    expect(versionMatches![0]).toContain('2.0.0')
    expect(versionMatches![1]).toContain('1.0.0')
  })

  // ── Malformed input ──────────────────────────────────────────────────

  it('returns content unchanged for unclosed array bracket', () => {
    const content = `array(
  'slug' => 'my-plugin',
  'version' => '1.0.0',
  // oops, no closing paren`

    // Should not throw, should return unchanged
    const result = patchTgmVersion(content, 'my-plugin', '2.0.0')

    expect(result).toBe(content)
  })

  // ── String values containing brackets ────────────────────────────────

  it('handles string values containing parentheses', () => {
    const content = `array(
  'name' => 'My (Cool) Plugin',
  'slug' => 'my-plugin',
  'version' => '1.0.0',
)`

    const result = patchTgmVersion(content, 'my-plugin', '2.0.0')

    expect(result).toContain("'version' => '2.0.0'")
    expect(result).toContain("'name' => 'My (Cool) Plugin'")
  })

  // ── Trailing commas ──────────────────────────────────────────────────

  it('handles entries without trailing commas', () => {
    const content = `array(
  'slug' => 'my-plugin',
  'version' => '1.0.0'
)`

    const result = patchTgmVersion(content, 'my-plugin', '2.0.0')

    expect(result).toContain("'version' => '2.0.0'")
  })

  it('handles entries with trailing commas', () => {
    const content = `array(
  'slug' => 'my-plugin',
  'version' => '1.0.0',
)`

    const result = patchTgmVersion(content, 'my-plugin', '2.0.0')

    expect(result).toContain("'version' => '2.0.0'")
  })

  // ── Comments between array entries ───────────────────────────────────

  it('handles single-line comments between entries', () => {
    const content = `array(
  'slug' => 'my-plugin',
  // This is the version
  'version' => '1.0.0',
)`

    const result = patchTgmVersion(content, 'my-plugin', '2.0.0')

    expect(result).toContain("'version' => '2.0.0'")
    expect(result).toContain('// This is the version')
  })

  it('handles block comments between entries', () => {
    const content = `array(
  'slug' => 'my-plugin',
  /* block comment */
  'version' => '1.0.0',
)`

    const result = patchTgmVersion(content, 'my-plugin', '2.0.0')

    expect(result).toContain("'version' => '2.0.0'")
    expect(result).toContain('/* block comment */')
  })

  // ── Slug substring safety ────────────────────────────────────────────

  it('does not match slug that is a substring of another slug', () => {
    const content = `$plugins = array(
			array(
				'slug'     => 'velum-core',
				'version'  => '1.0.0',
			),
			array(
				'slug'     => 'core',
				'version'  => '3.0.0',
			),
		);`

    const result = patchTgmVersion(content, 'core', '5.0.0')

    // Should only patch 'core', not 'velum-core'
    expect(result).toContain("'slug'     => 'velum-core'")
    // velum-core version should remain 1.0.0
    const blocks = result.split('velum-core')
    const afterVelumCore = blocks[1]
    expect(afterVelumCore).toContain("'version'  => '1.0.0'")
  })

  // ── Special regex chars in slug ──────────────────────────────────────

  it('handles special regex characters in slug', () => {
    const content = `array(
  'slug' => 'my.plugin+v2',
  'version' => '1.0.0',
)`

    const result = patchTgmVersion(content, 'my.plugin+v2', '2.0.0')

    expect(result).toContain("'version' => '2.0.0'")
  })

  it('does not match partial slug via regex chars', () => {
    const content = `array(
  'slug' => 'myXplugin',
  'version' => '1.0.0',
)`

    // "my.plugin" regex-wise would match "myXplugin" without escaping
    const result = patchTgmVersion(content, 'my.plugin', '2.0.0')

    expect(result).toBe(content)
  })

  // ── Bare parentheses (not array()) ──────────────────────────────────

  it('handles slug inside bare () without array keyword', () => {
    const content = `register_plugins(
  'slug' => 'my-plugin',
  'version' => '1.0.0',
)`

    const result = patchTgmVersion(content, 'my-plugin', '2.0.0')

    expect(result).toContain("'version' => '2.0.0'")
  })

  // ── Nested brackets in backward walk ──────────────────────────────

  it('handles nested [] values when walking backwards to find enclosing array', () => {
    const content = `[
  'options' => ['a', 'b'],
  'slug' => 'my-plugin',
  'version' => '1.0.0',
]`

    const result = patchTgmVersion(content, 'my-plugin', '3.0.0')

    expect(result).toContain("'version' => '3.0.0'")
    expect(result).toContain("'options' => ['a', 'b']")
  })

  // ── Slug outside any array structure ──────────────────────────────

  it('returns content unchanged when slug is not inside an array', () => {
    const content = `'slug' => 'my-plugin'
'version' => '1.0.0'`

    const result = patchTgmVersion(content, 'my-plugin', '2.0.0')

    expect(result).toBe(content)
  })

  // ── Full real-world Velum TGM file ───────────────────────────────────

  it('patches the real Velum TGM format correctly', () => {
    const content = `<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Arts\\Utilities\\Utilities;

add_action( 'tgmpa_register', 'velum_tgm_register_required_plugins' );
if ( ! function_exists( 'velum_tgm_register_required_plugins' ) ) {
	function velum_tgm_register_required_plugins() {
		$theme_slug            = VELUM_THEME_SLUG;
		$core_plugin_url       = Utilities::get_license_args_url( "https://artemsemkin.com/wp-json/edd/v1/file/{$theme_slug}/core-plugin", "{$theme_slug}_license_key" );
		$elementor_plugin_url  = Utilities::get_license_args_url( "https://artemsemkin.com/wp-json/edd/v1/file/{$theme_slug}/elementor-plugin", "{$theme_slug}_license_key" );

		$plugins = array(
			array(
				'name'     => esc_html_x( 'Velum Core', 'Required plugin name', 'velum' ),
				'slug'     => 'velum-core',
				'source'   => esc_url( $core_plugin_url ),
				'required' => true,
				'version'  => '1.0.0',
			),

			array(
				'name'     => esc_html_x( 'Velum Elementor', 'Required plugin name', 'velum' ),
				'slug'     => 'velum-elementor',
				'source'   => esc_url( $elementor_plugin_url ),
				'required' => true,
				'version'  => '1.0.0',
			),

			array(
				'name'     => esc_html_x( 'Elementor', 'Required plugin name', 'velum' ),
				'slug'     => 'elementor',
				'required' => true,
			),

			array(
				'name'     => esc_html_x( 'Contact Form 7', 'Required plugin name', 'velum' ),
				'slug'     => 'contact-form-7',
				'required' => false,
			),

			array(
				'name'     => esc_html_x( 'Safe SVG', 'Required plugin name', 'velum' ),
				'slug'     => 'safe-svg',
				'required' => false,
			),
		);

		$config = array(
			'id'           => $theme_slug,
			'default_path' => '',
			'menu'         => 'tgmpa-install-plugins',
			'has_notices'  => true,
			'dismissable'  => true,
			'dismiss_msg'  => '',
			'is_automatic' => false,
			'message'      => '',
		);

		tgmpa( $plugins, $config );
	}
}`

    // Patch velum-core
    let result = patchTgmVersion(content, 'velum-core', '1.0.1')
    expect(result).toContain("'slug'     => 'velum-core'")
    expect(result).toMatch(/'slug'\s*=>\s*'velum-core'[\s\S]*?'version'\s*=>\s*'1\.0\.1'/)
    // velum-elementor should remain unchanged
    expect(result).toMatch(/'slug'\s*=>\s*'velum-elementor'[\s\S]*?'version'\s*=>\s*'1\.0\.0'/)

    // Now also patch velum-elementor
    result = patchTgmVersion(result, 'velum-elementor', '1.0.1')
    expect(result).toMatch(/'slug'\s*=>\s*'velum-elementor'[\s\S]*?'version'\s*=>\s*'1\.0\.1'/)

    // Elementor entry (no version) should be unchanged
    expect(result).toContain("'slug'     => 'elementor'")

    // Config array should be completely untouched
    expect(result).toContain("'id'           => $theme_slug")
  })
})
