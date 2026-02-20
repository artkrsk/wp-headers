import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { buildComment, buildReadmeBlock, replaceComment, replaceReadmeBlock } from './core.js'
import { patchTgmVersion } from './patch-tgm.js'
import { themeStyleFromPkg, themeReadmeFromPkg, wpThemeStyle, wpThemeReadme } from './wp-theme.js'
import { pluginHeaderFromPkg, pluginReadmeFromPkg, wpPluginHeader, wpPluginReadme } from './wp-plugin.js'

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
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as Record<string, unknown>
  const wp = (pkg['wp'] as Record<string, unknown> | undefined) ?? {}

  if (mapping.type === 'theme') {
    if (!wp['theme']) {
      return
    }

    // style.css
    const styleConfig = themeStyleFromPkg(pkg, mapping.slug)
    writeFileSync(
      resolve(mapping.entityDir, phpSrc, 'style.css'),
      buildComment(wpThemeStyle(styleConfig)),
    )

    // readme.txt
    const themeReadmePath = resolve(mapping.entityDir, phpSrc, 'readme.txt')
    if (existsSync(themeReadmePath)) {
      const readmeContent = readFileSync(themeReadmePath, 'utf-8')
      const readmeConfig = themeReadmeFromPkg(pkg, mapping.slug)
      const block = buildReadmeBlock(readmeConfig.name, wpThemeReadme(readmeConfig))
      const replaced = replaceReadmeBlock(readmeContent, block)
      if (replaced !== null) {
        writeFileSync(themeReadmePath, replaced)
      }
    }
  } else {
    if (!wp['plugin']) {
      return
    }
    const version = (pkg['version'] as string | undefined) ?? '1.0.0'

    // Plugin PHP header
    const pluginPhpPath = resolve(mapping.entityDir, phpSrc, `${mapping.slug}.php`)
    if (existsSync(pluginPhpPath)) {
      const content = readFileSync(pluginPhpPath, 'utf-8')
      const headerConfig = pluginHeaderFromPkg(pkg, mapping.slug)
      const comment = buildComment(wpPluginHeader(headerConfig))
      const replaced = replaceComment(content, comment)
      if (replaced !== null) {
        const normalized = replaced.replace(/^\s*<\?(?:php|PHP)?\s*/, '')
        writeFileSync(pluginPhpPath, `<?php\n${normalized.trimStart()}`)
      }
    }

    // readme.txt
    const pluginReadmePath = resolve(mapping.entityDir, phpSrc, 'readme.txt')
    if (existsSync(pluginReadmePath)) {
      const readmeContent = readFileSync(pluginReadmePath, 'utf-8')
      const readmeConfig = pluginReadmeFromPkg(pkg, mapping.slug)
      const block = buildReadmeBlock(readmeConfig.name, wpPluginReadme(readmeConfig))
      const replaced = replaceReadmeBlock(readmeContent, block)
      if (replaced !== null) {
        writeFileSync(pluginReadmePath, replaced)
      }
    }

    // TGM version patching
    const pluginWp = wp['plugin'] as Record<string, unknown>
    const loadPluginsFile = pluginWp['loadPluginsFile'] as string | undefined
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
