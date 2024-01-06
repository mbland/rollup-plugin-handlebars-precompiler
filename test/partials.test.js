/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import collectPartials from '../lib/partials.js'
import Handlebars from 'handlebars'
import { describe, expect, test } from 'vitest'

describe('collectPartials', () => {
  /**
   * Returns the partial names parsed from a Handlebars template
   * @param {string} s - Handlebars template strin to parse
   * @returns {string[]} - a list of partial names parsed from the template
   */
  const partials = (s) => collectPartials(Handlebars.parse(s, {}))

  describe('parses', () => {
    test('regular partials', () => {
      const s = '{{ foo }}{{> bar }}{{ baz }}{{> quux }}{{ xyzzy }}{{> plugh }}'

      expect(partials(s))
        .toEqual(['bar', 'quux', 'plugh'])
    })

    test('partials with contexts or parameters', () => {
      expect(partials('{{> foo bar}}{{> baz quux=xyzzy }}'))
        .toEqual(['foo', 'baz'])
    })

    test('block partials', () => {
      expect(partials('{{#> foo }}bar{{>baz}}quux{{/foo}}'))
        .toEqual(['foo', 'baz'])
    })
  })

  describe('ignores', () => {
    test('dynamic partials', () => {
      expect(partials('{{> foo }}{{> (lookup . ignored) }}{{> bar }}'))
        .toEqual(['foo', 'bar'])
    })

    test('@partial-block', () => {
      expect(partials('Some text {{> @partial-block }}'))
        .toEqual([])
    })

    test('inline partials', () => {
      // Examples from:
      // - https://handlebarsjs.com/guide/partials.html#inline-partials
      const s = [
        '{{#*inline "myPartial"}}',
        '  My Content',
        '{{/inline}}',
        '{{#each people}}',
        '  {{> myPartial}}',
        '{{/each}}',
        '',
        '{{#> layout}}',
        '  {{#*inline "nav"}}',
        '    My Nav',
        '  {{/inline}}',
        '  {{#*inline "content"}}',
        '    My Content',
        '  {{/inline}}',
        '{{/layout}}'
      ].join('\n')

      expect(partials(s))
        .toEqual(['myPartial', 'layout'])
    })
  })
})
