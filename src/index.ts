import type { ErrorWithDiff, File, Reporter, Suite, Task, Test } from 'vitest'
import {
  startGroup,
  endGroup,
  error,
  type AnnotationProperties
} from '@actions/core'

type Vitest = Parameters<Exclude<Reporter['onInit'], undefined>>[0]

export type GitHubActionsReporterOptions = {
  /**
   * @default false
   */
  hideStackTrace?: boolean
}

export default class GitHubActionsReporter implements Reporter {
  ctx!: Vitest
  options: Required<GitHubActionsReporterOptions>

  constructor({ hideStackTrace = false }: GitHubActionsReporterOptions = {}) {
    this.options = {
      hideStackTrace
    }
  }

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

    const stackTrace = suite.result?.error?.stackStr ?? 'No stack trace'
    const message = this.options.hideStackTrace ? '.' : stackTrace

    error(message, {
      ...position,
      title: this.getErrorTitle(suite.result?.error, 'Failed Suite')
    })
  }

  private reportTest(filename: string, test: Test) {
    if (test.result?.state !== 'fail') return

    const position = this.getPositionFromError(filename, test.result?.error)

    const stackTrace = test.result?.error?.stackStr ?? 'No stack trace'
    const message = this.options.hideStackTrace ? '.' : stackTrace

    error(message, {
      ...position,
      title: this.getErrorTitle(test.result?.error, 'Failed Test')
    })
  }

  private getPositionFromError(
    filename: string,
    error?: ErrorWithDiff
  ): AnnotationProperties {
    const stack = error?.stack ?? ''

    const m = stack.match(/at (.+):(\d)+:(\d)+(?:\n|$)/)
    if (!m) {
      return { file: filename }
    }

    const [, file, startLine, startColumn] = m
    return {
      file: file ?? filename,
      startLine: startLine ? +startLine : undefined,
      startColumn: startColumn ? +startColumn : undefined
    }
  }

  private getErrorTitle(error: ErrorWithDiff | undefined, fallback: string) {
    return `${error?.name ?? 'Error'}: ${error?.message ?? fallback}`
  }
}
