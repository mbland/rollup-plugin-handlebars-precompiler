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
 * A Rollup plugin object for precompiling Handlebars templates.
 * @module rollup-plugin-handlebars-precompiler
 */

import { createFilter } from '@rollup/pluginutils'
import Handlebars from 'handlebars'

export const PLUGIN_NAME = 'handlebars-precompiler'
const DEFAULT_INCLUDE = ['**/*.hbs', '**/*.handlebars', '**/*.mustache']
const DEFAULT_EXCLUDE = 'node_modules/**'
const DEFAULT_PARTIALS = '**/_*'
const DEFAULT_PARTIAL_NAME = id => {
  return id.replace(/.*\//, '')    // extract the basename
    .replace(/\.[^.]*$/, '')       // remove the file extension, if present
    .replace(/^[^[:alnum:]]*/, '') // strip leading non-alphanumeric characters
}
const DEFAULT_PARTIAL_PATH = (partialName, importerPath) => {
  return `./_${partialName}.${importerPath.replace(/.*\./, '')}`
}

export const PLUGIN_ID = `\0${PLUGIN_NAME}`
const HANDLEBARS_PATH = 'handlebars/lib/handlebars.runtime'
const IMPORT_HANDLEBARS = `import Handlebars from '${HANDLEBARS_PATH}'`
const IMPORT_HELPERS = `import Render from '${PLUGIN_ID}'`

// https://github.com/handlebars-lang/handlebars.js/blob/master/docs/compiler-api.md
class PartialCollector extends Handlebars.Visitor {
  partials = []

  PartialStatement(partial) {
    this.collect(partial.name)
    return super.PartialStatement(partial)
  }

  PartialBlockStatement(partial) {
    this.collect(partial.name)
    return super.PartialBlockStatement(partial)
  }

  collect(n) { if (n.type === 'PathExpression') this.partials.push(n.original) }
}

/**
 * Rollup Handlebars precompiler implementation
 */
class PluginImpl {
  #helpers
  #isTemplate
  #isPartial
  #partialName
  #partialPath
  #compilerOpts
  #adjustSourceMap

  constructor(options = {}) {
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

  isTemplate(id) { return this.#isTemplate(id) }

  compile(code, id) {
    const opts = this.#compilerOpts(id)
    const ast = Handlebars.parse(code, opts)
    const compiled = Handlebars.precompile(ast, opts)
    const { code: tmpl = compiled, map: srcMap } = compiled
    const collector = new PartialCollector()
    collector.accept(ast)

    const beforeTmpl = [
      IMPORT_HANDLEBARS,
      IMPORT_HELPERS,
      ...collector.partials.map(p => `import '${this.#partialPath(p, id)}'`),
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

  #partialRegistration(id) {
    return `Handlebars.registerPartial('${this.#partialName(id)}', RawTemplate)`
  }
}

/**
 * Returns a Rollup plugin object for precompiling Handlebars templates.
 * @function default
 * @param {object} options object containing Handlebars compiler API options
 * @returns {object} a Rollup plugin that precompiles Handlebars templates
 */
export default function(options) {
  const p = new PluginImpl(options)
  return {
    name: PLUGIN_NAME,
    resolveId(id) { if (p.shouldEmitHelpersModule(id)) return id },
    load(id) { if (p.shouldEmitHelpersModule(id)) return p.helpersModule() },
    transform(code, id) { if (p.isTemplate(id)) return p.compile(code, id) }
  }
}
