import type { ParsedStack } from 'vitest'

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
const repositoryPrefixes = [
  `D:/a/${repository}/`,
  `/home/runner/work/${repository}/`
]

export const stringifyStacktrace = (
  stack: ParsedStack[],
  trimRepositoryPrefix: boolean
) => {
  return stack
    .map(s => {
      let file = s.file
      if (trimRepositoryPrefix) {
        file = trimPrefixes(file, repositoryPrefixes)
      }

      return `  at ${s.method ? `${s.method} ` : ''}${file}:${s.line}:${
        s.column
      }`
    })
    .join('\n')
}

const trimPrefixes = (str: string, prefixes: string[]) => {
  for (const p of prefixes) {
    if (str.startsWith(p)) {
      str = str.slice(p.length)
      break
    }
  }
  return str
}
