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

/**
 * @module rollup-plugin-handlebars-precompiler/lib
 */

import collectPartials from './partials.js'
// eslint-disable-next-line no-unused-vars
import { PartialName, PartialPath, PluginOptions } from './types.js'
import { createFilter } from '@rollup/pluginutils'
import Handlebars from 'handlebars'

export const PLUGIN_NAME = 'handlebars-precompiler'
const DEFAULT_INCLUDE = ['**/*.hbs', '**/*.handlebars', '**/*.mustache']
const DEFAULT_EXCLUDE = 'node_modules/**'
const DEFAULT_PARTIALS = '**/_*'

/** @type {PartialName} */
const DEFAULT_PARTIAL_NAME = function (id) {
  return id.replace(/.*\//, '')    // extract the basename
    .replace(/\.[^.]*$/, '')       // remove the file extension, if present
    .replace(/^[^[:alnum:]]*/, '') // strip leading non-alphanumeric characters
}

/** @type {PartialPath} */
const DEFAULT_PARTIAL_PATH = function (partialName, importerPath) {
  return `./_${partialName}.${importerPath.replace(/.*\./, '')}`
}

export const PLUGIN_ID = `\0${PLUGIN_NAME}`
const HANDLEBARS_PATH = 'handlebars/lib/handlebars.runtime'
const IMPORT_HANDLEBARS = `import Handlebars from '${HANDLEBARS_PATH}'`
const IMPORT_HELPERS = `import Render from '${PLUGIN_ID}'`

/**
 * @callback CompilerOpts
 * @param {string} id - import ID of module to compile
 * @returns {object} - Handlebars compiler options based on id
 */

/**
 * @callback AdjustSourceMap
 * @param {string} map - the Handlebars source map as a JSON string
 * @param {number} numLinesBeforeTmpl - number of empty lines to add to the
 *   beginning of the source mappings to account for the generated code before
 *   the precompiled template
 * @returns {import("rollup").SourceMapInput} - potentially modified Handlebars
 *   source map
 */

/**
 * Rollup Handlebars precompiler implementation
 */
export default class PluginImpl {
  #helpers
  #isTemplate
  #isPartial
  #partialName
  #partialPath
  /** @type {CompilerOpts} */
  #compilerOpts
  /** @type {AdjustSourceMap} */
  #adjustSourceMap

  /**
   * @param {PluginOptions} options - plugin configuration options
   */
  constructor(options = /** @type {PluginOptions} */ ({})) {
    this.#helpers = options.helpers || []
    this.#isTemplate = createFilter(
      options.include || DEFAULT_INCLUDE,
      options.exclude || DEFAULT_EXCLUDE
    )
    this.#isPartial = createFilter(options.partials || DEFAULT_PARTIALS)
    this.#partialName = options.partialName || DEFAULT_PARTIAL_NAME
    this.#partialPath = options.partialPath || DEFAULT_PARTIAL_PATH

    const compilerOpts = { ...options.compiler }
    delete compilerOpts.srcName
    delete compilerOpts.destName
    this.#compilerOpts = (id) => ({ srcName: id, ...compilerOpts })
    this.#adjustSourceMap = function adjustSourceMap(map, numLinesBeforeTmpl) {
      const parsed = JSON.parse(map)
      parsed.mappings = `${';'.repeat(numLinesBeforeTmpl)}${parsed.mappings}`
      return parsed
    }

    // This specifies that source maps can be disabled via "sourceMap: false":
    // - https://rollupjs.org/plugin-development/#source-code-transformations
    //
    // This specifies that source maps can be disabled via "sourcemap: false":
    // - https://rollupjs.org/troubleshooting/#warning-sourcemap-is-likely-to-be-incorrect
    if (options.sourceMap === false || options.sourcemap === false) {
      this.#compilerOpts = () => compilerOpts
      this.#adjustSourceMap = () => ({ mappings: '' })
    }
  }

  /**
   * @param {string} id - import identifier
   * @returns {boolean} - true if id is the plugin's import identifier
   */
  shouldEmitHelpersModule(id) { return id === PLUGIN_ID }

  helpersModule() {
    const helpers = this.#helpers
    return [
      IMPORT_HANDLEBARS,
      ...helpers.map((h, i) => `import registerHelpers${i} from './${h}'`),
      ...helpers.map((_, i) => `registerHelpers${i}(Handlebars)`),
      // Inspired by: https://stackoverflow.com/a/35385518
      'export default (rawTemplate) => ((context, options) => {',
      '  const t = document.createElement(\'template\')',
      '  t.innerHTML = rawTemplate(context, options)',
      '  return t.content',
      '})'
    ].join('\n')
  }

  /**
   * @param {string} id - import identifier
   * @returns {boolean} - true if id matches the filter for template files
   */
  isTemplate(id) { return this.#isTemplate(id) }

  /**
   * @typedef {object} Compiled
   * @property {string} code - the precompiled Handlebars template code
   * @property {string} map - the Handlebars source map as a JSON string
   */

  /**
   * @param {string} code - Handlebars template source to precompile
   * @param {string} id - file path used to import the Handlebars template
   * @returns {Partial<import("rollup").SourceDescription>} - JavaScript
   *   precompiled from a Handlebars template
   */
  compile(code, id) {
    const opts = this.#compilerOpts(id)
    const ast = Handlebars.parse(code, opts)
    const compiled = /** @type {Compiled} */ (Handlebars.precompile(ast, opts))
    const { code: tmpl = compiled, map: srcMap } = compiled

    const beforeTmpl = [
      IMPORT_HANDLEBARS,
      IMPORT_HELPERS,
      ...collectPartials(ast).map(p => `import '${this.#partialPath(p, id)}'`),
      'export const RawTemplate = Handlebars.template('
    ]
    const afterTmpl = [
      ')',
      'export default Render(RawTemplate)',
      ...(this.#isPartial(id) ? [ this.#partialRegistration(id) ] : [])
    ]
    return {
      code: [ ...beforeTmpl, tmpl, ...afterTmpl ].join('\n'),
      map: this.#adjustSourceMap(srcMap, beforeTmpl.length)
    }
  }

  /**
   * @param {string} id - id of the partial to register
   * @returns {string} - Handlebars.registerPartial statement for the partial
   */
  #partialRegistration(id) {
    return `Handlebars.registerPartial('${this.#partialName(id)}', RawTemplate)`
  }
}
