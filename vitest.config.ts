import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      include: [
        'src/core.ts',
        'src/wp-helpers.ts',
        'src/wp-theme.ts',
        'src/wp-plugin.ts',
        'src/patch-tgm.ts',
      ],
    },
  },
})
