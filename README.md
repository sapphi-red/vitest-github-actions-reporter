# vitest-github-actions-reporter

[![npm version](https://badge.fury.io/js/vitest-github-actions-reporter.svg)](https://badge.fury.io/js/vitest-github-actions-reporter) ![CI](https://github.com/sapphi-red/vitest-github-actions-reporter/workflows/CI/badge.svg) [![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

Vitest reporter to create annotations when running tests in GitHub Actions.

![image](https://user-images.githubusercontent.com/49056869/162130129-137511a1-9df4-4431-af88-5626d66f587a.png)

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
    reporters: process.env.GITHUB_ACTIONS
      ? ['default', new GithubActionsReporter()]
      : 'default'
  }
}
```

Then run `vitest` with GitHub Actions.
That's all. GitHub Actions will do everything other.

## Options

### `trimRepositoryPrefix`

_Default: `true`_  
Trims `/home/runner/{repository name}` / `D:\a\{repository name}` in stacktrace.
The image below is a preview when it is `false`.
![image](https://user-images.githubusercontent.com/49056869/162126739-a3daf5a2-ff37-46c5-b128-bb890fbcf05a.png)

### `hideStackTrace`

_Default: `false`_  
Hides stacktrace in message.
The image below is a preview when it is `true`.
![image](https://user-images.githubusercontent.com/49056869/156354039-750a6194-eb76-4adb-bbd6-7c2b65ec80a4.png)
