/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import HandlebarsPrecompiler from '../index.js'
import { PLUGIN_NAME, PLUGIN_ID } from '../lib/index.js'
import { describe, expect, test } from 'vitest'

/**
 * Used to test known defined methods on the plugin by type casting it.
 *
 * Without the type cast, we'd have to work around TypeScript errors such as:
 *
 * - Cannot invoke an object which is possibly 'undefined'. ts(2722)
 *
 * - This expression is not callable.
 *   Not all constituents of type 'ObjectHook<...>' are callable.
 *   Type '{ handler: (...) => ResolveIdResult | ... }' has no call signatures.
 *   ts(2349)
 * @typedef {object} HandlebarsPrecompilerPlugin
 * @property {string} name - name of the plugin
 * @property {Function} resolveId - rollup.ResolveIdHook
 * @property {Function} load - rollup.LoadHook
 * @property {Function} transform - rollup.TransformHook
 */

describe('HandlebarsPrecompiler', () => {
  const plugin = /** @type {HandlebarsPrecompilerPlugin} */ (
    HandlebarsPrecompiler({ helpers: ['foo.js'] })
  )

  test(`.name is ${PLUGIN_NAME}`, () => {
    expect(plugin.name).toBe(PLUGIN_NAME)
  })

  describe('resolveId', () => {
    test('resolves to own PLUGIN_ID', () => {
      expect(plugin.resolveId(PLUGIN_ID)).toBe(PLUGIN_ID)
    })

    test('resolves to undefined for PLUGIN_NAME or any other ID', () => {
      expect(plugin.resolveId(PLUGIN_NAME)).toBeUndefined()
    })
  })

  describe('load', () => {
    test('returns undefined if not for PLUGIN_ID', () => {
      expect(plugin.load(PLUGIN_NAME)).toBeUndefined()
    })

    test('emits helpers module for PLUGIN_ID', () => {
      expect(plugin.load(PLUGIN_ID)).toContain(
        'import registerHelpers0 from \'./foo.js\''
      )
    })
  })

  describe('transform', () => {
    const code = '<p>Hello, {{ entity }}!</p>'

    test('returns undefined if not a template id', () => {
      expect(plugin.transform(code, 'foo.js')).toBeUndefined()
    })

    test('returns a compiled module for a template id', () => {
      const compiled = plugin.transform(code, 'foo.hbs')

      expect(compiled).toBeInstanceOf(Object)
      expect(compiled.code).toContain('export default Render(RawTemplate)')
      expect(compiled).toHaveProperty('map')
    })
  })
})
