/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import TestPageOpener from 'test-page-opener'

describe('rollup-plugin-handlebars-precompiler', () => {
  /** @type {TestPageOpener} */
  let opener
  /** @type {Document} */
  let document

  beforeAll(async () => {
    opener = await TestPageOpener.create('/')

    const page = await opener.open('test/large/index.html')
    document = page.document
  })

  afterAll(() => opener.closeAll())

  test('renders element with Template', async () => {
    /** @type {(HTMLAnchorElement | null)} */
    const templateElem = document.querySelector('#app h1 a')

    expect(templateElem).not.toBeNull()
    expect((templateElem || {}).href).toContain('%22Hello,_World!%22')
  })

  test('renders element with RawTemplate', async () => {
    /** @type {(HTMLAnchorElement | null)} */
    const rawTemplateElem = document.querySelector('#app div a')

    expect(rawTemplateElem).not.toBeNull()
    expect((rawTemplateElem || {}).href).toContain('%22Hello,_World!%22')
  })
})
