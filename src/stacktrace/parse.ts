/*!
  https://github.com/vitest-dev/vitest/blob/c4d1151fb3e8110eafd12bdadabf9eb69e3978ef/packages/vitest/src/utils/source-map.ts#L48-L79
  MIT License
  Copyright (c) 2021-Present Anthony Fu <https://github.com/antfu>
  Copyright (c) 2021-Present Matias Capeletto <https://github.com/patak-dev>
  https://github.com/vitest-dev/vitest/blob/main/LICENSE
*/

import type { ParsedStack } from 'vitest'

const stackFnCallRE = /at (.*) \((.+):(\d+):(\d+)\)$/
const stackBarePathRE = /at ?(.*) (.+):(\d+):(\d+)$/

const stackIgnorePatterns = [
  'node:internal',
  '/vitest/dist/',
  '/node_modules/chai/',
  '/node_modules/tinypool/',
  '/node_modules/tinyspy/'
]

const slash = (str: string) => str.replace(/\\/g, '/')

export const parseStacktrace = (stackStr: string): ParsedStack[] => {
  const stackFrames = stackStr.split('\n').flatMap((raw): ParsedStack[] => {
    const line = raw.trim()
    const match = line.match(stackFnCallRE) || line.match(stackBarePathRE)
    if (!match) return []
    /* eslint-disable @typescript-eslint/no-non-null-assertion */

    let file = slash(match[2]!)
    if (file.startsWith('file://')) {
      file = file.slice(7)
    }

    if (stackIgnorePatterns.some(p => file.includes(p))) return []

    return [
      {
        method: match[1]!,
        file: match[2]!,
        line: parseInt(match[3]!),
        column: parseInt(match[4]!)
      }
    ]
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  })
  return stackFrames
}
