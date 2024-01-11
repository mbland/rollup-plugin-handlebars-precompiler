import HandlebarsPrecompiler from './index.js'
import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  plugins: [
    HandlebarsPrecompiler({ helpers: ['test/large/components/helpers.js'] })
  ],
  test: {
    outputFile: 'TESTS-TestSuites.xml',
    coverage: {
      reportsDirectory: 'coverage',
      exclude: [...(configDefaults.coverage.exclude || []), 'jsdoc', 'out']
    },
    server: {
      deps: {
        // Without this, jsdom tests will fail to import '.hbs' files
        // transformed by rollup-plugin-handlebars-precompiler.
        inline: ['test-page-opener']
      }
    }
  }
})
