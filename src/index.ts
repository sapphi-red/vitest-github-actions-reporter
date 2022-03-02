import type { ErrorWithDiff, File, Reporter, Suite, Task, Test } from 'vitest'
import { issue, issueCommand } from '@actions/core/lib/command'

type Vitest = Parameters<Exclude<Reporter['onInit'], undefined>>[0]

export default class GitHubActionsReporter implements Reporter {
  ctx!: Vitest

  onInit(ctx: Vitest) {
    this.ctx = ctx
  }

  async onFinished(files?: File[]) {
    if (!files) return

    issue('group', 'Vitest Annotations')
    this.reportFiles(files)
    issue('endgroup')
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

    issueCommand(
      'error',
      {
        ...position,
        title: this.getErrorTitle(suite.result?.error, 'Failed Suite')
      },
      suite.result?.error?.stackStr
    )
  }

  private reportTest(filename: string, test: Test) {
    if (test.result?.state !== 'fail') return

    const position = this.getPositionFromError(filename, test.result?.error)

    issueCommand(
      'error',
      {
        ...position,
        title: this.getErrorTitle(test.result?.error, 'Failed Test')
      },
      test.result.error?.stackStr
    )
  }

  private getPositionFromError(filename: string, error?: ErrorWithDiff) {
    const stack = error?.stack ?? ''

    const m = stack.match(/at (.+):(\d)+:(\d)+(?:\n|$)/)
    if (!m) {
      return { file: filename }
    }

    const [file, line, col] = m
    return { file: file ?? filename, line, col }
  }

  private getErrorTitle(error: ErrorWithDiff | undefined, fallback: string) {
    return `${error?.name ?? 'Error'}: ${error?.message ?? fallback}`
  }
}
