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
import { SourceMapConsumer } from 'source-map-js'

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
    await this.reportFiles(files)
    endGroup()
  }

  private async reportFiles(files: File[]) {
    for (const file of files) {
      if (file.result?.error) {
        await this.reportSuiteError(file.filepath, file)
      }
      this.reportTasks(file.filepath, file.tasks)
    }
  }

  private async reportTasks(filename: string, tasks: Task[]) {
    for (const task of tasks) {
      if (task.type === 'suite') {
        if (task.result?.error) {
          await this.reportSuiteError(filename, task)
        }

        this.reportTasks(filename, task.tasks)
      } else {
        await this.reportTest(filename, task)
      }
    }
  }

  private async reportSuiteError(filename: string, suite: Suite) {
    const stackTrace = this.parseStacktrace(suite.result?.error?.stackStr)
    const position = await this.getPositionFromError(filename, stackTrace)
    const message = this.createMessage(stackTrace)

    error(message, {
      ...position,
      title: this.getErrorTitle(suite.result?.error, 'Failed Suite')
    })
  }

  private async reportTest(filename: string, test: Test) {
    if (test.result?.state !== 'fail') return

    const stackTrace = this.parseStacktrace(test.result?.error?.stackStr)
    const position = await this.getPositionFromError(filename, stackTrace)
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

  private async getPositionFromError(
    filename: string,
    stacktrace?: ParsedStack[]
  ): Promise<AnnotationProperties> {
    if (!stacktrace || !stacktrace[0]) {
      return { file: filename }
    }

    const { file, line, column } = stacktrace[0]
    const sourcemap = this.ctx.vitenode.fetchCache.get(file)?.result?.map
    if (!sourcemap) {
      return {
        file,
        startLine: line,
        startColumn: column
      }
    }
    const consumer = await new SourceMapConsumer(sourcemap)
    const position = consumer.originalPositionFor({
      line: line,
      column: column
    })
    return {
      file: file,
      startLine: position.line,
      startColumn: position.column
    }
  }

  private getErrorTitle(error: ErrorWithDiff | undefined, fallback: string) {
    return `${error?.name ?? 'Error'}: ${error?.message ?? fallback}`
  }
}
