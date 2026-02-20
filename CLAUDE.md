# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A TypeScript library (`@artemsemkin/wp-headers`) that generates and patches WordPress file headers. Layered architecture separates pure string I/O from WordPress conventions.

Produces:
- **style.css** theme headers (WordPress `class-wp-theme.php` field order)
- **Plugin PHP** file headers (`get_plugin_data()` field order)
- **readme.txt** header blocks (`=== Name ===` format for WordPress.org)
- **TGM version patches** (updates version strings inside TGM-style PHP plugin arrays)

## Commands

```bash
pnpm build          # tsc -p tsconfig.build.json -> dist/
pnpm test           # vitest run (all tests)
pnpm test:watch     # vitest in watch mode
pnpm test:coverage  # vitest with v8 coverage
```

Run a single test file:
```bash
pnpm vitest run tests/core.test.ts
```

## Architecture

ESM-only (`"type": "module"`). Single export path: `.` -> `dist/index.ts`.

Three-layer architecture:

```
Layer 3: Process ---- File I/O orchestration (processMapping)
Layer 2: WordPress -- Typed configs, field ordering, pkg.json adapters
Layer 1: Core ------- buildComment(), buildReadmeBlock(), replaceComment(), replaceReadmeBlock()
```

| Module | Layer | Purpose |
|---|---|---|
| `core.ts` | 1 | Pure string serializers + replacers (no WP knowledge) |
| `wp-helpers.ts` | 2 | `titleCase()`, `deriveName()` -- shared utilities |
| `wp-theme.ts` | 2 | Theme types, field builders (`wpThemeStyle`, `wpThemeReadme`), pkg adapters |
| `wp-plugin.ts` | 2 | Plugin types, field builders (`wpPluginHeader`, `wpPluginReadme`), pkg adapters |
| `patch-tgm.ts` | -- | `patchTgmVersion()` -- regex + depth-tracked bracket walking for TGM arrays |
| `process.ts` | 3 | `processMapping()` -- composes layers 1+2 with file I/O |

## Key Patterns

- Layer 1 functions are pure string->string with no WordPress knowledge
- Layer 2 typed configs (`ThemeStyleConfig`, `PluginHeaderConfig`, etc.) enforce valid WP properties at the type level
- Layer 2 field builders (`wpThemeStyle()`, etc.) convert typed configs -> ordered `Record<string, string>`
- Layer 2 pkg adapters (`themeStyleFromPkg()`, etc.) convert `package.json` -> typed configs
- Header field data comes from `pkg.wp.theme` or `pkg.wp.plugin` in package.json
- Theme name is derived from `pkg.name` by stripping `@scope/` prefix and `-theme` suffix, then title-casing
- Plugin name uses `wp.plugin.name` if set, otherwise title-cases the slug
- Optional fields are only emitted when truthy (empty strings are omitted)
- `replaceComment` and `replaceReadmeBlock` return `null` when content can't be matched (no-op signal)
- Imports use `.js` extensions for ESM resolution
- `dist/` is tracked in git for direct GitHub-based consumption

## Tests

Tests live in `tests/` with vitest globals enabled:
- `core.test.ts` -- serializers + replacers
- `wp-theme.test.ts` -- theme field builders + pkg adapters (composed with core)
- `wp-plugin.test.ts` -- plugin field builders + pkg adapters (composed with core)
- `patch-tgm.test.ts` -- TGM version patching
- `process.test.ts` -- processMapping file I/O orchestration

Coverage is scoped to pure-function modules and process orchestration (excludes `index.ts`).
