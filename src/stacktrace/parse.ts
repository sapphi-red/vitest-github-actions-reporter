/* eslint-disable @typescript-eslint/no-non-null-assertion */
/*!
  https://github.com/vitest-dev/vitest/blob/f1cdfb6960a1eb39345f973529bc1e72ab4090b4/packages/vitest/src/utils/source-map.ts#L59-L115
  MIT License
  Copyright (c) 2021-Present Anthony Fu <https://github.com/antfu>
  Copyright (c) 2021-Present Matias Capeletto <https://github.com/patak-dev>
  https://github.com/vitest-dev/vitest/blob/main/LICENSE
*/

import type { ParsedStack } from 'vitest'

const stackIgnorePatterns = [
  'node:internal',
  '/vitest/dist/',
  '/node_modules/chai/',
  '/node_modules/tinypool/',
  '/node_modules/tinyspy/'
]

const slash = (str: string) => str.replace(/\\/g, '/')

function notNullish<T>(v: T | null | undefined): v is NonNullable<T> {
  return v != null
}

function extractLocation(urlLike: string) {
  // Fail-fast but return locations like "(native)"
  if (!urlLike.includes(':')) return [urlLike]

  const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/
  const parts = regExp.exec(urlLike.replace(/[()]/g, ''))
  if (!parts) return [urlLike]
  return [parts[1], parts[2] || undefined, parts[3] || undefined]
}

export const parseStacktrace = (
  stackStr: string,
  full = false
): ParsedStack[] => {
  const stackFrames = stackStr
    .split('\n')
    // Based on https://github.com/stacktracejs/error-stack-parser
    // Credit to stacktracejs
    .map((raw): ParsedStack | null => {
      let line = raw.trim()

      if (line.includes('(eval '))
        line = line
          .replace(/eval code/g, 'eval')
          .replace(/(\(eval at [^()]*)|(,.*$)/g, '')

      let sanitizedLine = line
        .replace(/^\s+/, '')
        .replace(/\(eval code/g, '(')
        .replace(/^.*?\s+/, '')

      // capture and preserve the parenthesized location "(/foo/my bar.js:12:87)" in
      // case it has spaces in it, as the string is split on \s+ later on
      const location = sanitizedLine.match(/ (\(.+\)$)/)

      // remove the parenthesized location from the line, if it was matched
      sanitizedLine = location
        ? sanitizedLine.replace(location[0]!, '')
        : sanitizedLine

      // if a location was matched, pass it to extractLocation() otherwise pass all sanitizedLine
      // because this line doesn't have function name
      const [url, lineNumber, columnNumber] = extractLocation(
        location ? location[1]! : sanitizedLine
      )
      let method = (location && sanitizedLine) || ''
      let file = url && ['eval', '<anonymous>'].includes(url) ? undefined : url

      if (!file || !lineNumber || !columnNumber) return null

      if (method.startsWith('async ')) method = method.slice(6)

      if (file.startsWith('file://')) file = file.slice(7)

      if (!full && stackIgnorePatterns.some(p => file && file.includes(p)))
        return null

      return {
        method,
        file: slash(file),
        line: parseInt(lineNumber),
        column: parseInt(columnNumber)
      }
    })
    .filter(notNullish)

  return stackFrames
}
