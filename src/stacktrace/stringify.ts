import type { ParsedStack } from 'vitest'

const repository = process.env.GITHUB_WORKSPACE
const repositoryPrefixes = repository ? [repository.replace(/\/?$/, '/')] : []

export const stringifyStacktrace = (
  stack: ParsedStack[],
  trimRepositoryPrefix: boolean
) => {
  return stack
    .map(s => {
      let file = s.file
      if (trimRepositoryPrefix && repositoryPrefixes.length > 0) {
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
