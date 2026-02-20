export { buildComment, buildReadmeBlock, replaceComment, replaceReadmeBlock } from './core.js';
export type { ThemeStyleConfig, ThemeReadmeConfig } from './wp-theme.js';
export { wpThemeStyle, wpThemeReadme, themeStyleFromPkg, themeReadmeFromPkg } from './wp-theme.js';
export type { PluginHeaderConfig, PluginReadmeConfig } from './wp-plugin.js';
export { wpPluginHeader, wpPluginReadme, pluginHeaderFromPkg, pluginReadmeFromPkg } from './wp-plugin.js';
export { titleCase, deriveName } from './wp-helpers.js';
export { patchTgmVersion } from './patch-tgm.js';
