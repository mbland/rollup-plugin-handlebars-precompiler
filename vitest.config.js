import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    outputFile: 'TESTS-TestSuites.xml',
    coverage: {
      reportsDirectory: 'coverage',
      exclude: [...configDefaults.coverage.exclude, 'jsdoc', 'out']
    }
  }
})
