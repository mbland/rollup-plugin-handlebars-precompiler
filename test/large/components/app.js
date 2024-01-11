/* eslint-env browser */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Template, { RawTemplate } from './introduction.hbs'
// eslint-disable-next-line no-unused-vars
import { InitParams } from '../types.js'


export default class App {
  /**
   * Initializes the Introduction within the document.
   * @param {InitParams} config - app initialization parameters
   */
  init({ appElem }) {
    const args = {
      message: 'Hello, World!',
      url: 'https://en.wikipedia.org/wiki/%22Hello,_World!%22_program'
    }
    appElem.appendChild(Template(args))

    const rawVersionElem = document.createElement('div')
    rawVersionElem.innerHTML = RawTemplate(args)
    appElem.appendChild(rawVersionElem)
  }
}
