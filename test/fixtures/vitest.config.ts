import { defineConfig } from 'vitest/config'
import GitHubActionsReporter from '../../src/index'

export default defineConfig({
  test: {
    reporters: new GitHubActionsReporter({
      trimRepositoryPrefix: true // make CI output is same with local
    })
  }
})
