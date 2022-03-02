// https://github.com/actions/toolkit/blob/2f164000dcd42fb08287824a3bc3030dbed33687/packages/core/src/command.ts#L83-L106

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCommandValue(input: any): string {
  if (input === null || input === undefined) {
    return ''
  } else if (typeof input === 'string' || input instanceof String) {
    return input as string
  }
  return JSON.stringify(input)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function escapeData(s: any): string {
  return toCommandValue(s)
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function escapeProperty(s: any): string {
  return toCommandValue(s)
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A')
    .replace(/:/g, '%3A')
    .replace(/,/g, '%2C')
}
