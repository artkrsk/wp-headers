import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { buildPluginHeader } from './plugin-header'
import { buildThemeHeader } from './theme-header'
import { patchTgmVersion } from './patch-tgm'
import { replacePluginFileHeader } from './replace-header'

export interface HeaderMapping {
  type: 'theme' | 'plugin'
  slug: string
  entityDir: string
  /** Base path to resolve TGM file from (usually the theme's PHP source dir) */
  tgmBasePath: string
  /** Subdirectory within entityDir containing PHP source files */
  phpSrc?: string
}

function processMapping(mapping: HeaderMapping): void {
  const phpSrc = mapping.phpSrc ?? 'src/php'
  const pkgPath = resolve(mapping.entityDir, 'package.json')
  if (!existsSync(pkgPath)) {
    return
  }
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as Record<
    string,
    unknown
  >
  const wp = (pkg['wp'] as Record<string, unknown> | undefined) ?? {}

  if (mapping.type === 'theme') {
    if (!wp['theme']) {
      return
    }
    writeFileSync(
      resolve(mapping.entityDir, phpSrc, 'style.css'),
      buildThemeHeader({ pkg, slug: mapping.slug }),
    )
  } else {
    if (!wp['plugin']) {
      return
    }
    const plugin = wp['plugin'] as Record<string, unknown>
    const version = (pkg['version'] as string | undefined) ?? '1.0.0'

    const pluginPhpPath = resolve(
      mapping.entityDir,
      phpSrc,
      `${mapping.slug}.php`,
    )
    if (existsSync(pluginPhpPath)) {
      const content = readFileSync(pluginPhpPath, 'utf-8')
      const replaced = replacePluginFileHeader(
        content,
        buildPluginHeader({ pkg, slug: mapping.slug }),
      )
      if (replaced !== null) {
        writeFileSync(pluginPhpPath, replaced)
      }
    }

    const loadPluginsFile = plugin['loadPluginsFile'] as string | undefined
    if (loadPluginsFile && mapping.tgmBasePath) {
      const tgmFilePath = resolve(mapping.tgmBasePath, loadPluginsFile)
      if (existsSync(tgmFilePath)) {
        const tgmContent = readFileSync(tgmFilePath, 'utf-8')
        const patched = patchTgmVersion(tgmContent, mapping.slug, version)
        if (patched !== tgmContent) {
          writeFileSync(tgmFilePath, patched)
        }
      }
    }
  }
}

/**
 * Vite plugin that generates WordPress file headers (style.css, plugin PHP)
 * and patches TGM version entries on build and during dev server.
 */
export function wpHeaders(mappings: HeaderMapping[]): Plugin {
  return {
    name: 'vite-plugin-wp-headers',

    configResolved() {
      for (const mapping of mappings) {
        processMapping(mapping)
      }
    },

    configureServer(server) {
      for (const mapping of mappings) {
        const pkgPath = resolve(mapping.entityDir, 'package.json')
        server.watcher.add(pkgPath)
        server.watcher.on('change', (filePath: string) => {
          if (filePath !== pkgPath) {
            return
          }
          try {
            processMapping(mapping)
          } catch (err) {
            server.config.logger.error(String(err))
          }
        })
      }
    },
  }
}
