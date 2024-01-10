/*
 * Original work Copyright (c) 2016 Benjamin Legrand under the MIT License
 * https://github.com/benjilegnard/rollup-plugin-handlebars
 *
 * Original work Copyright (c) 2016 Mixmax, Inc under the MIT License
 * https://github.com/mixmaxhq/rollup-plugin-handlebars-plus
 *
 * Derived work Copyright (c) 2023 Mike Bland <mbland@acm.org> under the
 * Mozilla Public License Version 2.0
 * https://github.com/mbland/rollup-plugin-handlebars-precompiler
 *
 * MIT License
 * -----------
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Mozilla Public License Version 2.0
 * ----------------------------------
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://mozilla.org/MPL/2.0/.
 */

import PluginImpl, { PLUGIN_NAME } from './lib/index.js'
// eslint-disable-next-line no-unused-vars
import { PluginOptions, Transform } from './lib/types.js'

/**
 * A Rollup plugin object for precompiling Handlebars templates.
 * @module rollup-plugin-handlebars-precompiler
 */

/**
 * @typedef {object} RollupPlugin
 * @property {string} name - plugin name
 * @property {Function} resolveId - resolves the plugin's own import ID
 * @property {Function} load - emits the plugin's helper module code
 * @property {Function} transform - emits JavaScript code compiled from
 *   Handlebars templates
 * @see https://rollupjs.org/plugin-development/
 */

/**
 * Returns a Rollup plugin object for precompiling Handlebars templates.
 * @function default
 * @param {PluginOptions} options - plugin configuration options
 * @returns {RollupPlugin} - the configured plugin object
 */
export default function HandlebarsPrecompiler(options) {
  const p = new PluginImpl(options)
  return {
    name: PLUGIN_NAME,

    /**
     * @param {string} id - import identifier to resolve
     * @returns {(string | undefined)} - the plugin ID if id matches it
     * @see https://rollupjs.org/plugin-development/#resolveid
     */
    resolveId: function (id) {
      return p.shouldEmitHelpersModule(id) ? id : undefined
    },

    /**
     * @param {string} id - import identifier to load
     * @returns {(string | undefined)} - the plugin helper module if id matches
     * @see https://rollupjs.org/plugin-development/#load
     */
    load: function (id) {
      return p.shouldEmitHelpersModule(id) ? p.helpersModule() : undefined
    },

    /** @type {Transform} */
    transform: function (code, id) {
      return p.isTemplate(id) ? p.compile(code, id) : undefined
    }
  }
}
