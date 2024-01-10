import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from '../vitest.config.js'

export default mergeConfig(baseConfig, defineConfig({
  test: {
    reporters: [ 'junit', 'default' ],
    coverage: {
      enabled: true,
      reporter: [ 'text', 'lcovonly' ]
    }
  }
}))
