import { defineConfig, mergeConfig } from 'vitest/config'
import baseConfig from '../vitest.config'

export default mergeConfig(baseConfig, defineConfig({
  test: {
    reporters: [ 'junit', 'default' ],
    coverage: {
      enabled: true,
      reporter: [ 'text', 'lcovonly' ]
    }
  }
}))
