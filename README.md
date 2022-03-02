# vitest-github-actions-reporter

[![npm version](https://badge.fury.io/js/vitest-github-actions-reporter.svg)](https://badge.fury.io/js/vitest-github-actions-reporter) ![CI](https://github.com/sapphi-red/vitest-github-actions-reporter/workflows/CI/badge.svg) [![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)  

Vitest reporter to create annotations when running tests in GitHub Actions.

Thanks to [`jest-github-actions-reporter`](https://github.com/cschleiden/jest-github-actions-reporter) for ideas.

## Install
```shell
npm i -D vitest-github-actions-reporter # yarn add -D vitest-github-actions-reporter
```

## Usage
Add this reporter to `vite.config.js` / `vite.config.ts`.
```js
// vite.config.js / vite.config.ts
import GithubActionsReporter from 'vitest-github-actions-reporter'

export default {
  test: {
    reporters: process.env.GITHUB_ACTIONS ? new GithubActionsReporter() : 'default'
  }
}
```
