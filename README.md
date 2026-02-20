# @artemsemkin/wp-headers

Generate and patch WordPress file headers from `package.json` data.

## Install

```bash
npm install @artemsemkin/wp-headers
```

## What it does

Reads `wp.theme` or `wp.plugin` fields from a `package.json` and generates or updates WordPress header comments in target files (`style.css`, plugin PHP, `readme.txt`). If a file already contains a header comment, it replaces it in place. If not, it writes a new one. Also patches version strings in TGM-style PHP plugin arrays.

## Examples

### Theme: `package.json` → `style.css`

Given this in your theme's `package.json`:

```json
{
  "name": "@starter/flavor-theme",
  "version": "1.0.0",
  "description": "A starter theme for WordPress",
  "wp": {
    "theme": {
      "uri": "https://example.com/flavor",
      "author": "Dev Studio",
      "authorUri": "https://example.com",
      "requires": "6.0",
      "testedUpTo": "6.7",
      "requiresPHP": "7.4",
      "license": "GPL-2.0-or-later",
      "licenseUri": "https://www.gnu.org/licenses/gpl-2.0.html",
      "textDomain": "flavor",
      "tags": ["blog", "one-column"]
    }
  }
}
```

Running `processMapping({ type: 'theme', slug: 'flavor', entityDir: '/path/to/theme' })` generates this `style.css`:

```css
/*
 * Theme Name: Flavor
 * Theme URI: https://example.com/flavor
 * Author: Dev Studio
 * Author URI: https://example.com
 * Description: A starter theme for WordPress
 * Version: 1.0.0
 * Requires at least: 6.0
 * Tested up to: 6.7
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: flavor
 * Tags: blog, one-column
 */
```

### Plugin: `package.json` → PHP header

Given this in your plugin's `package.json`:

```json
{
  "name": "@starter/flavor-core",
  "version": "1.0.0",
  "description": "Core functionality for Flavor theme",
  "wp": {
    "plugin": {
      "name": "Flavor Core",
      "uri": "https://example.com/flavor-core",
      "author": "Dev Studio",
      "authorUri": "https://example.com",
      "requires": "6.0",
      "testedUpTo": "6.7",
      "requiresPHP": "7.4",
      "license": "GPL-2.0-or-later",
      "textDomain": "flavor-core"
    }
  }
}
```

Running `processMapping({ type: 'plugin', slug: 'flavor-core', entityDir: '/path/to/plugin' })` generates or updates the header at the top of `flavor-core.php`:

```php
/**
 * Plugin Name: Flavor Core
 * Plugin URI: https://example.com/flavor-core
 * Description: Core functionality for Flavor theme
 * Version: 1.0.0
 * Requires at least: 6.0
 * Tested up to: 6.7
 * Requires PHP: 7.4
 * Author: Dev Studio
 * Author URI: https://example.com
 * License: GPL-2.0-or-later
 * Text Domain: flavor-core
 */
```

### TGM version patching

WordPress themes commonly use TGMPA to register required plugins with minimum version constraints. When a plugin's `package.json` includes `wp.plugin.loadPluginsFile`, the tool finds the matching slug in the TGM PHP file and patches its version string.

Given this TGM registration file in your theme:

```php
<?php

add_action( 'tgmpa_register', 'flavor_tgm_register_required_plugins' );
function flavor_tgm_register_required_plugins() {
    $plugins = array(
        // Bundled plugins — have a version constraint
        array(
            'name'     => 'Flavor Core',
            'slug'     => 'flavor-core',
            'source'   => esc_url( $core_plugin_url ),
            'required' => true,
            'version'  => '1.0.0',
        ),
        array(
            'name'     => 'Flavor Elementor',
            'slug'     => 'flavor-elementor',
            'source'   => esc_url( $elementor_plugin_url ),
            'required' => true,
            'version'  => '1.0.0',
        ),
        // Third-party plugins — no version field, pulled from wp.org
        array(
            'name'     => 'Elementor',
            'slug'     => 'elementor',
            'required' => true,
        ),
        array(
            'name'     => 'Contact Form 7',
            'slug'     => 'contact-form-7',
            'required' => false,
        ),
    );

    tgmpa( $plugins, $config );
}
```

When `flavor-core`'s `package.json` has `"version": "2.0.0"`, processing updates only the matching entry — the Elementor and Contact Form 7 entries are left untouched because they don't have a `version` field and their slugs don't match:

```diff
-            'version'  => '1.0.0',
+            'version'  => '2.0.0',
```

Whitespace alignment, quote styles, nested function calls, and other plugin entries are preserved.

## Usage

```ts
import { processMapping } from '@artemsemkin/wp-headers'

processMapping({
  type: 'plugin',
  slug: 'my-plugin',
  entityDir: '/path/to/plugin',
  tgmBasePath: '/path/to/theme/src/php',
})
```

## Vite integration

Use [`@artemsemkin/vite-plugin-wp-headers`](https://www.npmjs.com/package/@artemsemkin/vite-plugin-wp-headers) to automate header generation during Vite's build lifecycle and watch for changes during dev.
