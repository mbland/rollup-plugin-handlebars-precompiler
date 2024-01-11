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
 * @module rollup-plugin-handlebars-precompiler/partials
 */

import Handlebars from 'handlebars'

/**
 * Collects the names of partial templates from a Handlebars template
 * @see https://github.com/handlebars-lang/handlebars.js/blob/master/docs/compiler-api.md
 */
class PartialCollector extends Handlebars.Visitor {
  /** @type {string[]} */
  partials = []

  /**
   * @param {hbs.AST.PartialStatement} partial - partial name to evaluate
   */
  PartialStatement(partial) {
    this.collect(partial.name)
    super.PartialStatement(partial)
  }
  /**
   * @param {hbs.AST.PartialBlockStatement} partial - partial name to evaluate
   */
  PartialBlockStatement(partial) {
    this.collect(partial.name)
    super.PartialBlockStatement(partial)
  }

  /**
   * @param {hbs.AST.PathExpression | hbs.AST.SubExpression} n - potential
   *   partial name to collect
   */
  collect(n) {
    if (n.type === 'PathExpression' && n.original !== '@partial-block') {
      this.partials.push(n.original)
    }
  }
}

/**
 * Returns the partial names parsed from a Handlebars template
 * @param {hbs.AST.Program} ast - abstract syntax tree for a Handlebars template
 *   returned by Handlebars.parse()
 * @returns {string[]} - a list of partial names parsed from the template
 * @see https://handlebarsjs.com/guide/partials.html
 * @see https://github.com/handlebars-lang/handlebars.js/blob/master/docs/compiler-api.md
 */
export default function collectPartials(ast) {
  const collector = new PartialCollector()
  collector.accept(ast)
  return collector.partials
}
