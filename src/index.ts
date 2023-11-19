import type {
  ErrorWithDiff,
  File,
  ParsedStack,
  Reporter,
  Task,
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
      this.reportTaskErrors(file.filepath, file)
      this.reportTasks(file.filepath, file.tasks)
    }
  }

  private reportTasks(filename: string, tasks: Task[]) {
    for (const task of tasks) {
      if (task.type === 'suite') {
        this.reportTaskErrors(filename, task)

        this.reportTasks(filename, task.tasks)
      } else if (task.type === 'test') {
        this.reportTaskErrors(filename, task)
      } else if (task.type === 'custom') {
        // TODO: benchmark?
      } else {
        checkNever(task)
      }
    }
  }

  private reportTaskErrors(filename: string, task: Task) {
    for (const err of task.result?.errors ?? []) {
      this.reportTaskError(task.type, filename, err)
    }
  }

  private reportTaskError(
    taskType: 'suite' | 'test' | 'custom',
    filename: string,
    err: ErrorWithDiff
  ) {
    const stackTrace = this.parseStacktrace(err.stackStr)
    const position = this.getPositionFromError(filename, stackTrace)
    const message = this.createMessage(stackTrace)

    error(message, {
      ...position,
      title: this.getErrorTitle(
        err,
        `Failed ${taskType[0]!.toUpperCase()}${taskType.slice(1)}`
      )
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
