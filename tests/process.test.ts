import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('node:fs')

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { HeaderMapping } from '../src/process'
import { processMapping } from '../src/process'

const mockedExistsSync = vi.mocked(existsSync)
const mockedReadFileSync = vi.mocked(readFileSync)
const mockedWriteFileSync = vi.mocked(writeFileSync)

const ENTITY_DIR = '/fake/entity'
const PHP_SRC = 'src/php'

const minimalPluginPkg = JSON.stringify({
  name: 'test-plugin',
  version: '2.0.0',
  wp: {
    plugin: {
      name: 'Test Plugin',
    },
  },
})

function makeMapping(overrides?: Partial<HeaderMapping>): HeaderMapping {
  return {
    type: 'plugin',
    slug: 'test-plugin',
    entityDir: ENTITY_DIR,
    tgmBasePath: '/fake/tgm',
    ...overrides,
  }
}

function setupFs(files: Record<string, string>): void {
  mockedExistsSync.mockImplementation((p) => (p as string) in files)
  mockedReadFileSync.mockImplementation((p, _enc) => {
    const content = files[p as string]
    if (content === undefined) {
      throw new Error(`ENOENT: ${p}`)
    }
    return content
  })
}

/** Get what was written to a path, or null if nothing was written */
function getWritten(filePath: string): string | null {
  const call = mockedWriteFileSync.mock.calls.find((c) => c[0] === filePath)
  return call ? (call[1] as string) : null
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('plugin PHP insert-when-missing', () => {
  const pluginPhpPath = resolve(ENTITY_DIR, PHP_SRC, 'test-plugin.php')

  it('inserts header when no /* ... */ block exists', () => {
    setupFs({
      [resolve(ENTITY_DIR, 'package.json')]: minimalPluginPkg,
      [pluginPhpPath]: '<?php\n\nnamespace TestPlugin;\n\nclass Main {}\n',
    })

    processMapping(makeMapping())

    const written = getWritten(pluginPhpPath)
    expect(written).not.toBeNull()
    expect(written).toMatch(/^<\?php\n\/\*\n/)
    expect(written).toContain('Plugin Name: Test Plugin')
    expect(written).toContain('namespace TestPlugin;')
  })

  it('inserts header into <?php-only file', () => {
    setupFs({
      [resolve(ENTITY_DIR, 'package.json')]: minimalPluginPkg,
      [pluginPhpPath]: '<?php\n',
    })

    processMapping(makeMapping())

    const written = getWritten(pluginPhpPath)
    expect(written).toMatch(/^<\?php\n\/\*\n/)
    expect(written).toContain('Plugin Name: Test Plugin')
  })

  it('still replaces existing header normally', () => {
    setupFs({
      [resolve(ENTITY_DIR, 'package.json')]: minimalPluginPkg,
      [pluginPhpPath]: '<?php\n/*\nPlugin Name: Old\nVersion: 1.0.0\n*/\n\nclass Main {}\n',
    })

    processMapping(makeMapping())

    const written = getWritten(pluginPhpPath)
    expect(written).toContain('Plugin Name: Test Plugin')
    expect(written).toContain('Version: 2.0.0')
    expect(written).not.toContain('Old')
  })
})

describe('BOM stripping', () => {
  const pluginPhpPath = resolve(ENTITY_DIR, PHP_SRC, 'test-plugin.php')

  it('strips BOM before <?php so header insertion works', () => {
    setupFs({
      [resolve(ENTITY_DIR, 'package.json')]: minimalPluginPkg,
      [pluginPhpPath]: '\uFEFF<?php\n\necho "hello";\n',
    })

    processMapping(makeMapping())

    const written = getWritten(pluginPhpPath)
    expect(written).not.toBeNull()
    expect(written).toMatch(/^<\?php\n/)
    expect(written).not.toContain('\uFEFF')
    expect(written).toContain('Plugin Name: Test Plugin')
  })

  it('strips BOM from existing header file', () => {
    setupFs({
      [resolve(ENTITY_DIR, 'package.json')]: minimalPluginPkg,
      [pluginPhpPath]: '\uFEFF<?php\n/*\nPlugin Name: Old\n*/\n\necho 1;\n',
    })

    processMapping(makeMapping())

    const written = getWritten(pluginPhpPath)
    expect(written).toMatch(/^<\?php\n/)
    expect(written).not.toContain('\uFEFF')
  })
})

describe('readme.txt insert-when-missing', () => {
  const readmePath = resolve(ENTITY_DIR, PHP_SRC, 'readme.txt')

  it('prepends block when no === Title === exists', () => {
    setupFs({
      [resolve(ENTITY_DIR, 'package.json')]: minimalPluginPkg,
      [readmePath]: 'Some existing content.\n\n== Description ==\n\nHello.\n',
    })

    processMapping(makeMapping())

    const written = getWritten(readmePath)
    expect(written).not.toBeNull()
    expect(written).toMatch(/^=== Test Plugin ===/)
    expect(written).toContain('Some existing content.')
  })

  it('still replaces existing readme header normally', () => {
    setupFs({
      [resolve(ENTITY_DIR, 'package.json')]: minimalPluginPkg,
      [readmePath]: '=== Old Name ===\nStable tag: 1.0.0\n\n== Description ==\n\nHello.\n',
    })

    processMapping(makeMapping())

    const written = getWritten(readmePath)
    expect(written).toContain('=== Test Plugin ===')
    expect(written).toContain('Stable tag: 2.0.0')
    expect(written).toContain('== Description ==')
    expect(written).not.toContain('Old Name')
  })
})
