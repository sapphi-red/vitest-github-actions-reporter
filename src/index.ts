import type {
  ErrorWithDiff,
  File,
  ParsedStack,
  Reporter,
  Suite,
  Task,
  Test,
  Vitest
} from 'vitest'
import {
  startGroup,
  endGroup,
  error,
  type AnnotationProperties
} from '@actions/core'
import { parseStacktrace } from './stacktrace/parse'
import { stringifyStacktrace } from './stacktrace/stringify'

export type GitHubActionsReporterOptions = {
  /**
   * @default true
   */
  trimRepositoryPrefix?: boolean
  /**
   * @default false
   */
  hideStackTrace?: boolean
}

export default class GitHubActionsReporter implements Reporter {
  ctx!: Vitest
  options: Required<GitHubActionsReporterOptions>

  constructor({
    trimRepositoryPrefix = true,
    hideStackTrace = false
  }: GitHubActionsReporterOptions = {}) {
    this.options = {
      trimRepositoryPrefix,
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
      if (file.result?.error) {
        this.reportSuiteError(file.filepath, file)
      }
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
      } else if (task.type === 'test') {
        this.reportTest(filename, task)
      } else if (task.type === 'custom') {
        // TODO: benchmark?
      } else {
        checkNever(task)
      }
    }
  }

  private reportSuiteError(filename: string, suite: Suite) {
    const stackTrace = this.parseStacktrace(suite.result?.error?.stackStr)
    const position = this.getPositionFromError(filename, stackTrace)
    const message = this.createMessage(stackTrace)

    error(message, {
      ...position,
      title: this.getErrorTitle(suite.result?.error, 'Failed Suite')
    })
  }

  private reportTest(filename: string, test: Test) {
    if (test.result?.state !== 'fail') return

    const stackTrace = this.parseStacktrace(test.result?.error?.stackStr)
    const position = this.getPositionFromError(filename, stackTrace)
    const message = this.createMessage(stackTrace)

    error(message, {
      ...position,
      title: this.getErrorTitle(test.result?.error, 'Failed Test')
    })
  }

  private parseStacktrace(stacktraceStr: string | undefined) {
    if (!stacktraceStr) return undefined
    return parseStacktrace(stacktraceStr)
  }

  private createMessage(stacktrace: ParsedStack[] | undefined) {
    if (this.options.hideStackTrace) return '.'

    if (!stacktrace) return 'No stacktrace'
    return stringifyStacktrace(stacktrace, this.options.trimRepositoryPrefix)
  }

  private getPositionFromError(
    filename: string,
    stacktrace?: ParsedStack[]
  ): AnnotationProperties {
    if (!stacktrace || !stacktrace[0]) {
      return { file: filename }
    }

    const { file, line, column } = stacktrace[0]
    return {
      file: file,
      startLine: line,
      startColumn: column
    }
  }

  private getErrorTitle(error: ErrorWithDiff | undefined, fallback: string) {
    return `${error?.name ?? 'Error'}: ${error?.message ?? fallback}`
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
function checkNever(_: never) {}
