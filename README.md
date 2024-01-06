# rollup-plugin-handlebars-precompiler

[Rollup][] plugin to precompile [Handlebars][] templates into [JavaScript modules][]

_**Status**: I've still got a bit of work to do before publishing v1.0.0. I need
to add tests based on the mbland/tomcat-servlet-testing-example project from
whence this came and add more documentation. I plan to finish this by
2024-01-08._

Source: <https://github.com/mbland/rollup-plugin-handlebars-precompiler>

[![License](https://img.shields.io/github/license/mbland/rollup-plugin-handlebars-precompiler.svg)](https://github.com/mbland/rollup-plugin-handlebars-precompiler/blob/main/LICENSE.txt)
[![CI status](https://github.com/mbland/rollup-plugin-handlebars-precompiler/actions/workflows/run-tests.yaml/badge.svg)](https://github.com/mbland/rollup-plugin-handlebars-precompiler/actions/workflows/run-tests.yaml?branch=main)
[![Test results](https://github.com/mbland/rollup-plugin-handlebars-precompiler/actions/workflows/publish-test-results.yaml/badge.svg)](https://github.com/mbland/rollup-plugin-handlebars-precompiler/actions/workflows/publish-test-results.yaml?branch=main)
[![Coverage Status](https://coveralls.io/repos/github/mbland/rollup-plugin-handlebars-precompiler/badge.svg?branch=main)][coveralls-rphp]
[![npm version](https://badge.fury.io/js/rollup-plugin-handlebars-precompiler.svg)][npm-rphp]

## Installation

Add this package to your project's `devDependencies`, e.g., using [pnpm][]:

```sh
pnpm add -D rollup-plugin-handlebars-precompiler
```

## Features

- Generates JavaScript/ECMAScript/ES6 modules (ESM) only.
  - [Modules are supported by all current browsers][esm-caniuse].
  - [Modules are supported by all currently supported versions of
     Node.js][esm-node].
- Client code imports template files directly, as though they were JavaScript
  modules to begin with, as modules generated by this plugin will:
  - Import the Handlebars runtime
  - Import Handlebars helper files specified in the plugin configuration
  - Automatically detect and register partials and automatically import them
    where needed
- Provides a convenient syntax for both accessing individual top-level child
  nodes and adding the entire template to the DOM at once.
- Flexible configuration for specifying which files include Handlebars templates
  and helpers, with reasonable defaults for discovering templates and partials.
- Emits [Handlebars source maps][] unless explicitly disabled.

## Usage

Each generated Handlebars template module exports two functions:

- `RawTemplate()` emits the raw string from applying a Handlebars template.
- The default export emits a [DocumentFragment][] created from the result of
  `RawTemplate()`.

Most of the time, you'll want to use the default export, imported as
`Template()` by convention.

## Configuration

## Motivation

## Examples

My [mbland/tomcat-servlet-testing-example][] project

### Component pattern

## Development

Uses [pnpm][] and [Vitest][] for building and testing. The [Vitest browser
mode][] (using the [@vitest/browser][] plugin) enables all the tests to run in
either the [jsdom environment][] or the browser unchanged.

Uses [GitHub Actions][] for continuous integration.

Developed using [Vim][], [Visual Studio Code][], and [IntelliJ IDEA][]
interchangeably, depending on my inclination from moment to moment.

## Background

I developed this while developing the frontend component of
[mbland/tomcat-servlet-testing-example][], found under
`strcalc/src/main/frontend`.

## Prior art

There were two existing Rollup plugins for compiling Handlebars templates from
which I learned to write this one.

### [rollup-plugin-handlebars][]

This was the first Rollup plugin to support Handlebars. It's very brief and easy
to understand, but doesn't support:

- automatic helper imports
- automatic partial detection, registration, and imports
- source maps.

It exports a function that emits the raw string from the applied template, but
not one for instantiating it.

`rollup-plugin-handlebars-precompiler` borrows its include/exclude filters
for template discovery verbatim from this plugin.

### [rollup-plugin-handlebars-plus][]

This plugin was derived from the first, but does support:

- automatic helper imports
- automatic partial detection, registration, and imports

It does not support Handlebars source maps.

TODO: more to come...

## Copyright

Original work [rollup-plugin-handlebars][] &copy; 2016 Benjamin Legrand under
the MIT License

Original work [rollup-plugin-handlebars-plus][] &copy; 2016 Mixmax, Inc under
the MIT License

Derived work [rollup-plugin-handlebars-precompiler][] &copy; 2023 Mike Bland <mbland@acm.org> (<https://mike-bland.com/>)
under the Mozilla Public License 2.0

## Open Source Licenses

This software is made available as [Open Source software][] under the [MIT
License][] ("Original work") and the [Mozilla Public License
2.0][] ("Derived work").

For the text of the Mozilla Public License 2.0, see the
[LICENSE.txt](./LICENSE.txt) file. See the [MPL 2.0 FAQ][mpl-faq] for a higher
level explanation.

[Rollup]: https://rollupjs.org/
[Handlebars]: https://handlebarsjs.com/
[JavaScript Modules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
[coveralls-rphp]: https://coveralls.io/github/mbland/rollup-plugin-handlebars-precompiler?branch=main
[npm-rphp]: https://www.npmjs.com/package/rollup-plugin-handlebars-precompiler
[Handlebars source maps]: https://handlebarsjs.com/api-reference/compilation.html#handlebars-precompile-template-options
[DocumentFragment]: https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment
[pnpm]: https://pnpm.io/
[esm-caniuse]: https://caniuse.com/es6-module
[esm-node]: https://nodejs.org/docs/latest-v18.x/api/esm.html
[Vitest]: https://vitest.dev/
[GitHub Actions]: https://docs.github.com/actions
[mbland/tomcat-servlet-testing-example]: https://github.com/mbland/tomcat-servlet-testing-example
[Vim]: https://www.vim.org/
[Visual Studio Code]: https://code.visualstudio.com/
[IntelliJ IDEA]: https://www.jetbrains.com/idea/
[Vitest browser mode]: https://vitest.dev/guide/browser.html
[@vitest/browser]: https://www.npmjs.com/package/@vitest/browser
[jsdom environment]: https://vitest.dev/guide/environment.html
[rollup-plugin-handlebars]: https://github.com/benjilegnard/rollup-plugin-handlebars
[rollup-plugin-handlebars-plus]: https://github.com/mixmaxhq/rollup-plugin-handlebars-plus
[rollup-plugin-handlebars-precompiler]: https://github.com/mbland/rollup-plugin-handlebars-precompiler
[Open Source software]: https://opensource.org/osd-annotated
[MIT License]: https://opensource.org/license/mit/
[Mozilla Public License 2.0]: https://www.mozilla.org/MPL/
[mpl-faq]: https://www.mozilla.org/MPL/2.0/FAQ/
