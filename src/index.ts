import type { ErrorWithDiff, File, Reporter, Suite, Task, Test } from 'vitest'
import { startGroup, endGroup, error } from '@actions/core'

type Vitest = Parameters<Exclude<Reporter['onInit'], undefined>>[0]

export default class GitHubActionsReporter implements Reporter {
  ctx!: Vitest

  onInit(ctx: Vitest) {
    this.ctx = ctx
  }

  async onFinished(files?: File[]) {
    if (!files) return

    startGroup('Vitest Annotations')
    this.reportFiles(files)
    endGroup()
  }

  private reportFiles(files: File[]) {
    for (const file of files) {
      this.reportTasks(file.filepath, file.tasks)
    }
  }

  private reportTasks(filename: string, tasks: Task[]) {
    for (const task of tasks) {
      if (task.type === 'suite') {
        if (task.result?.error) {
          this.reportSuiteError(filename, task)
        }

        this.reportTasks(filename, task.tasks)
      } else {
        this.reportTest(filename, task)
      }
    }
  }

  private reportSuiteError(filename: string, suite: Suite) {
    const position = this.getPositionFromError(filename, suite.result?.error)

    error(suite.result?.error?.stackStr ?? 'No stack trace', {
      ...position,
      title: this.getErrorTitle(suite.result?.error, 'Failed Suite')
    })
  }

  private reportTest(filename: string, test: Test) {
    if (test.result?.state !== 'fail') return

    const position = this.getPositionFromError(filename, test.result?.error)

    error(test.result.error?.stackStr ?? 'No stack trace', {
      ...position,
      title: this.getErrorTitle(test.result?.error, 'Failed Test')
    })
  }

  private getPositionFromError(filename: string, error?: ErrorWithDiff) {
    const stack = error?.stack ?? ''

    const m = stack.match(/at (.+):(\d)+:(\d)+(?:\n|$)/)
    if (!m) {
      return { file: filename }
    }

    const [, file, line, col] = m
    return { file: file ?? filename, line, col }
  }

  private getErrorTitle(error: ErrorWithDiff | undefined, fallback: string) {
    return `${error?.name ?? 'Error'}: ${error?.message ?? fallback}`
  }
}
