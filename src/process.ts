import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildComment, buildReadmeBlock, replaceComment, replaceReadmeBlock } from './core.js'
import { patchTgmVersion } from './patch-tgm.js'
import { themeStyleFromPkg, themeReadmeFromPkg, wpThemeStyle, wpThemeReadme } from './wp-theme.js'
import { pluginHeaderFromPkg, pluginReadmeFromPkg, wpPluginHeader, wpPluginReadme } from './wp-plugin.js'

/** Read a UTF-8 file, stripping BOM if present */
export function readText(filePath: string): string {
  return readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '')
}

export interface HeaderMapping {
  type: 'theme' | 'plugin'
  slug: string
  entityDir: string
  /** Base path to resolve TGM file from (usually the theme's PHP source dir) */
  tgmBasePath: string
  /** Subdirectory within entityDir containing PHP source files */
  phpSrc?: string
}

export function processMapping(mapping: HeaderMapping): void {
  const phpSrc = mapping.phpSrc ?? 'src/php'
  const pkgPath = resolve(mapping.entityDir, 'package.json')
  if (!existsSync(pkgPath)) {
    return
  }
  const pkg = JSON.parse(readText(pkgPath)) as Record<string, unknown>
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
      const readmeContent = readText(themeReadmePath)
      const readmeConfig = themeReadmeFromPkg(pkg, mapping.slug)
      const block = buildReadmeBlock(readmeConfig.name, wpThemeReadme(readmeConfig))
      writeFileSync(themeReadmePath, replaceReadmeBlock(readmeContent, block) ?? block + readmeContent)
    }
  } else {
    if (!wp['plugin']) {
      return
    }
    const version = (pkg['version'] as string | undefined) ?? '1.0.0'

    // Plugin PHP header
    const pluginPhpPath = resolve(mapping.entityDir, phpSrc, `${mapping.slug}.php`)
    if (existsSync(pluginPhpPath)) {
      const content = readText(pluginPhpPath)
      const headerConfig = pluginHeaderFromPkg(pkg, mapping.slug)
      const comment = buildComment(wpPluginHeader(headerConfig))
      const replaced = replaceComment(content, comment)
      if (replaced !== null) {
        const normalized = replaced.replace(/^\s*<\?(?:php|PHP)?\s*/, '')
        writeFileSync(pluginPhpPath, `<?php\n${normalized.trimStart()}`)
      } else {
        const stripped = content.replace(/^\s*<\?(?:php|PHP)?\s*/, '')
        writeFileSync(pluginPhpPath, `<?php\n${comment}\n${stripped.trimStart()}`)
      }
    }

    // readme.txt
    const pluginReadmePath = resolve(mapping.entityDir, phpSrc, 'readme.txt')
    if (existsSync(pluginReadmePath)) {
      const readmeContent = readText(pluginReadmePath)
      const readmeConfig = pluginReadmeFromPkg(pkg, mapping.slug)
      const block = buildReadmeBlock(readmeConfig.name, wpPluginReadme(readmeConfig))
      writeFileSync(pluginReadmePath, replaceReadmeBlock(readmeContent, block) ?? block + readmeContent)
    }

    // TGM version patching
    const pluginWp = wp['plugin'] as Record<string, unknown>
    const loadPluginsFile = pluginWp['loadPluginsFile'] as string | undefined
    if (loadPluginsFile && mapping.tgmBasePath) {
      const tgmFilePath = resolve(mapping.tgmBasePath, loadPluginsFile)
      if (existsSync(tgmFilePath)) {
        const tgmContent = readText(tgmFilePath)
        const patched = patchTgmVersion(tgmContent, mapping.slug, version)
        if (patched !== tgmContent) {
          writeFileSync(tgmFilePath, patched)
        }
      }
    }
  }
}
