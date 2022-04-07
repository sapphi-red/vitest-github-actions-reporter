/// <reference types="vitest" />

import { defineConfig } from 'vite'
import GitHubActionsReporter from '../../src/index'

export default defineConfig({
  test: {
    reporters: new GitHubActionsReporter()
  }
})
