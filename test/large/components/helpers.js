/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * This is an example of a custom Handlebars helper, adapted directly from:
 * - https://handlebarsjs.com/guide/expressions.html#helpers
 */


/**
 * Exports a function to register Handlebars helpers.
 *
 * Passed to rollup-plugin-handlebars-precompiler via options.helpers.
 * @see https://handlebarsjs.com/api-reference/runtime.html#handlebars-registerhelper-name-helper
 * @module components/helpers
 */

/**
 * Registers helper functions via Handlebars.registerHelper().
 * @function default
 * @param {module} Handlebars The Handlebars runtime module
 */
export default function(Handlebars) {
  /**
   * @typedef {object} LinkHelperOptions
   * @property {Object.<string, string>} hash - hash arguments from the link tag
   * @see https://handlebarsjs.com/guide/expressions.html#helpers
   */

  /**
   * @param {string} text - the anchor text for the generated link
   * @param {LinkHelperOptions} options - options including the href URL
   * @returns {Handlebars.SafeString} - properly escaped <a> element text
   */
  const linkHelper = function(text, options) {
    const attrs = Object.keys(options.hash).map(key => {
      return `${Handlebars.escapeExpression(key)}=` +
        `"${Handlebars.escapeExpression(options.hash[key])}"`
    })
    return new Handlebars.SafeString(
      `<a ${attrs.join(' ')}>${Handlebars.escapeExpression(text)}</a>`
    )
  }
  Handlebars.registerHelper('link', linkHelper)
}
