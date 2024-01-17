/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

declare module "*.hbs" {
  export const RawTemplate: Handlebars.TemplateDelegate
  export interface TemplateRenderer {
    (context: any, options?: Handlebars.RuntimeOptions): DocumentFragment
  }
  const Template: TemplateRenderer
  export default Template
}
