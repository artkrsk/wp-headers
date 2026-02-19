import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      include: [
        'src/theme-header.ts',
        'src/plugin-header.ts',
        'src/replace-header.ts',
        'src/patch-tgm.ts',
      ],
    },
  },
})
