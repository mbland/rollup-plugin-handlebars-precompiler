/* eslint-env browser */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import App from './components/app.js'
// eslint-disable-next-line no-unused-vars
import { InitParams } from './types.js'

document.addEventListener(
  'DOMContentLoaded',
  () => {
    /** @type {(HTMLDivElement | null)} */
    const appElem = document.querySelector('#app')
    if (appElem === null) return console.error('no #app element')

    /** @type {InitParams} */
    const initParams = { appElem }
    new App().init(initParams)
  },
  { once: true }
)
