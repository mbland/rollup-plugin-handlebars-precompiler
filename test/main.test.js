/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import HandlebarsPrecompiler from '../index.js'
import { PLUGIN_NAME } from '../lib/index.js'
import { describe, expect, test } from 'vitest'

const PLUGIN_ID = `\0${PLUGIN_NAME}`

describe('HandlebarsPrecompiler', () => {
  const plugin = HandlebarsPrecompiler({
    helpers: ['foo.js']
  })

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
