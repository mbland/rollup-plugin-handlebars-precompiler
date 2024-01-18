/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

declare namespace HandlebarsPrecompiler {
  export interface TemplateRenderer {
    (context: any, options?: Handlebars.RuntimeOptions): DocumentFragment
  }
}

declare module "*.hbs" {
  export const RawTemplate: Handlebars.TemplateDelegate
  const Template: HandlebarsPrecompiler.TemplateRenderer
  export default Template
}
