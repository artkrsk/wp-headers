# @artemsemkin/wp-headers

Generate and patch WordPress file headers from `package.json` data.

## Install

```bash
npm install @artemsemkin/wp-headers
```

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

This reads `package.json` from `entityDir`, generates the appropriate WordPress headers, and writes them to the target files (`style.css`, plugin PHP, `readme.txt`).

Header field data comes from `pkg.wp.theme` or `pkg.wp.plugin` in your `package.json`.
