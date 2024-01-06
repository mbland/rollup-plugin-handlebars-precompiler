/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import PluginImpl, { PLUGIN_ID } from '../lib/index.js'
import { describe, expect, test } from 'vitest'
import { resolve } from 'node:path'

describe('PluginImpl', () => {
  test('shouldEmitHelpersModule() true if plugin ID', () => {
    const impl = new PluginImpl()

    expect(impl.shouldEmitHelpersModule(PLUGIN_ID)).toBe(true)
    expect(impl.shouldEmitHelpersModule('some-other-plugin')).toBe(false)
  })

  test('helpersModule() emits module that calls specified helpers', () => {
    const impl = new PluginImpl({ helpers: ['foo.js', 'bar/baz.js'] })

    const moduleCode = impl.helpersModule()

    expect(moduleCode).toBe([
      'import Handlebars from \'handlebars/lib/handlebars.runtime\'',
      'import registerHelpers0 from \'./foo.js\'',
      'import registerHelpers1 from \'./bar/baz.js\'',
      'registerHelpers0(Handlebars)',
      'registerHelpers1(Handlebars)',
      'export default (rawTemplate) => ((context, options) => {',
      '  const t = document.createElement(\'template\')',
      '  t.innerHTML = rawTemplate(context, options)',
      '  return t.content',
      '})'
    ].join('\n'))
  })

  describe('isTemplate()', () => {
    test('true when matching default include filter', () => {
      const impl = new PluginImpl()

      expect(impl.isTemplate('foo.hbs')).toBe(true)
      expect(impl.isTemplate('bar/baz.handlebars')).toBe(true)
      expect(impl.isTemplate('quux/xyzzy/plugh.mustache')).toBe(true)
      expect(impl.isTemplate('frobozz/notatemplate.js')).toBe(false)
    })

    test('false when matching default exclude filter', () => {
      const impl = new PluginImpl()

      // checkFilter() resolves filter paths against process.cwd() by default.
      // This means the DEFAULT_EXCLUDE value 'node_modules/**' actually only
      // matches paths prefixed with `${process.cwd}/node_modules/`.
      //
      // We could set DEFAULT_EXCLUDE to '**/node_modules/**', but this seems a
      // little sloppy. Here we resolve the example paths to process.cwd() like
      // Rollup apparently does at runtime.
      //
      // - https://www.npmjs.com/package/@rollup/pluginutils#resolve
      // - https://nodejs.org/docs/latest-v20.x/api/path.html#pathresolvepaths
      expect(impl.isTemplate(resolve('node_modules/foo.hbs'))).toBe(false)
      expect(impl.isTemplate(resolve('node_modules/bar/baz.handlebars')))
        .toBe(false)
    })

    test('true when matching custom include filter', () => {
      const impl = new PluginImpl({include: '**/*.frobozz'})

      expect(impl.isTemplate('foo/bar/baz.hbs')).toBe(false)
      expect(impl.isTemplate('foo/bar/baz.frobozz')).toBe(true)
    })

    test('false when matching custom exclude filter', () => {
      // Note that an ID can't match any exclude patterns before matching any
      // include patterns. Here we effectively negate one of the DEFAULT_INCLUDE
      // patterns.
      const impl = new PluginImpl({exclude: '**/*.mustache'})

      expect(impl.isTemplate('foo.hbs')).toBe(true)
      expect(impl.isTemplate('bar/baz.handlebars')).toBe(true)
      expect(impl.isTemplate('quux/xyzzy/plugh.mustache')).toBe(false)
    })
  })

  describe('compile()', () => {
    const PREFIX = [
      'import Handlebars from \'handlebars/lib/handlebars.runtime\'',
      `import Render from '${PLUGIN_ID}'`
    ].join('\n')
    const BEGIN_TEMPLATE = 'export const RawTemplate = Handlebars.template(\n'
    const SUFFIX = '\n)\nexport default Render(RawTemplate)'

    const templateStr = '<p>Hello, {{ recipient }}</p>'

    const mappingSkipsPrefix = (prefix) => {
      // Really? All the methods on String and Array, and no .count()?
      const numLines = prefix.length - prefix.replaceAll('\n', '').length
      return expect.stringMatching(new RegExp(`^;{${numLines}}`))
    }

    test('emits precompiled template module and source map', () => {
      const impl = new PluginImpl()

      const { code, map } = impl.compile(templateStr, 'foo.hbs')

      const expectedPrefix = `${PREFIX}\n${BEGIN_TEMPLATE}`
      expect(code.substring(0, expectedPrefix.length)).toBe(expectedPrefix)
      expect(code.substring(code.length - SUFFIX.length)).toBe(SUFFIX)
      expect(map).toMatchObject({
        sources: [ 'foo.hbs' ],
        mappings: mappingSkipsPrefix(expectedPrefix)
      })
    })

    describe('emits empty source map if', () => {
      test.each(['sourceMap', 'sourcemap'])('options.%s === false', key => {
        const impl = new PluginImpl({ [key]: false })

        const { map } = impl.compile(templateStr, 'foo.hbs')

        expect(map).toStrictEqual({ mappings: '' })
      })
    })

    test('ignores options.compiler.{srcName,destName}', () => {
      const impl = new PluginImpl({
        compiler: { srcName: 'bar/baz.handlebars', destName: 'quux/xyzzy.js' }
      })

      const { map } = impl.compile(templateStr, 'foo.hbs')

      expect(map).toHaveProperty('sources', [ 'foo.hbs' ])
      expect(map).not.toHaveProperty('file')
    })
  })
})
