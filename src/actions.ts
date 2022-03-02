export const startGroup = (groupName: string) => `::group::${groupName}`

export const endGroup = () => `::endgroup::`

export const outputError = (
  obj: {
    file?: string
    line?: number | string
    endLine?: number | string
    col?: number | string
    endColumn?: number | string
    title?: string
  },
  message?: string
) => {
  const args = Object.entries(obj)
    .map(([key, val]) => `${key}=${val}`)
    .join(',')

  return `::error ${args}::${message}`
}
