// Core
export { buildComment, buildReadmeBlock, replaceComment, replaceReadmeBlock } from './core.js'

// WordPress — Theme
export type { ThemeStyleConfig, ThemeReadmeConfig } from './wp-theme.js'
export { wpThemeStyle, wpThemeReadme, themeStyleFromPkg, themeReadmeFromPkg } from './wp-theme.js'

// WordPress — Plugin
export type { PluginHeaderConfig, PluginReadmeConfig } from './wp-plugin.js'
export { wpPluginHeader, wpPluginReadme, pluginHeaderFromPkg, pluginReadmeFromPkg } from './wp-plugin.js'

// Helpers
export { titleCase, deriveName } from './wp-helpers.js'

// TGM
export { patchTgmVersion } from './patch-tgm.js'
