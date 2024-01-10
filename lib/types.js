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
 * @callback PartialName
 * @param {string} id - import identifier of a Handlebars partial template
 * @returns {string} - the partial name derived from id
 */
/** @type {PartialName} */
export let PartialName

/**
 * @callback PartialPath
 * @param {string} partialName - name of a partial from which to derive its path
 * @param {string} importerPath - path of the module importing the template
 * @returns {string} - the path to the partial as derived from the arguments
 */
/** @type {PartialPath} */
export let PartialPath

/**
 * An approximation of Handlebars's PrecompileOptions
 * @typedef {object} PrecompileOptions
 * @property {string} [srcName] - input file path used to generate source map;
 *   should not be set, and will be deleted if present
 * @property {string} [destName] - destination file path used to generate source
 *   map; should not be set, and will be deleted if present
 * @see https://handlebarsjs.com/api-reference/compilation.html
 */

/**
 * @typedef {object} PluginOptions
 * @property {string[]} [helpers] - an array of file paths to modules containing
 *   Handlebars helper functions
 * @property {(string | string[])} [include] - one or more patterns matching
 *   Handlebars template files to transform
 * @property {(string | string[])} [exclude] - one or more patterns matching
 *   Handlebars template files to exclude from transformation
 * @property {(string | string[])} [partials] - one or more patterns matching
 *   Handlebars template files containing partials
 * @property {PartialName} [partialName] - function to transform a partial file
 *   name into the name used to apply the partial in other templates
 * @property {PartialPath} [partialPath] - function to transform a partial's
 *   name and that of the module importing it into its import path
 * @property {PrecompileOptions} [compiler] - compiler options passed through to
 *   Handlebars.parse() and Handlebars.precompile()
 * @property {boolean} [sourcemap] - disables source map generation when false
 * @property {boolean} [sourceMap] - disables source map generation when false
 */
/** @type {PluginOptions} */
export let PluginOptions

/**
 * @typedef {object} Compiled
 * @property {string} code - the precompiled Handlebars template code
 * @property {string} map - the Handlebars source map as a JSON string
 */
/** @type {Compiled} */
export let Compiled

/**
 * @typedef {object} SourceMap - a source map for transformed source code
 * @property {string} mappings - encoded mapping data
 * @see https://sourcemaps.info/spec.html
 */
/** @type {SourceMap} */
export let SourceMap

/**
 * @typedef {object} TransformResult - result from RollupPlugin.transform()
 * @property {string} code - the transformed source code
 * @property {SourceMap} map - the source map for the transformed source code
 */
/** @type {TransformResult} */
export let TransformResult

/**
 * @callback Transform
 * @param {string} code - source code to potentially transform
 * @param {string} id - import ID of source file
 * @returns {(TransformResult | undefined)} - JavaScript precompiled from a
 *   Handlebars template, if id matches the configured template filter
 * @see https://rollupjs.org/plugin-development/#transform
 */
/** @type {Transform} */
export let Transform
