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

When a plugin's `package.json` includes `wp.plugin.loadPluginsFile`, the tool also patches version strings inside TGM-style PHP arrays. Given this PHP file registered via `tgmBasePath`:

```php
$plugins = array(
    array(
        'name'     => 'Flavor Core',
        'slug'     => 'flavor-core',
        'version'  => '1.0.0',
    ),
);
```

After processing with `version: "2.0.0"` in `package.json`, the version field is updated in place:

```php
        'version'  => '2.0.0',
```

Whitespace alignment, quote styles, and other entries are preserved.

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
