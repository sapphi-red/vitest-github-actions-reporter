import { execa } from 'execa'
import { expect, it } from 'vitest'
import { normalizePath } from 'vite'
import { fileURLToPath } from 'node:url'
import { escapeData, escapeProperty } from './utils'

const currentDir = fileURLToPath(new URL('../', import.meta.url))
const escapedCurrentDirs = [currentDir, normalizePath(currentDir)].flatMap(
  dir => [escapeData(dir), escapeProperty(dir)]
)

const formatMessage = (message: string) => {
  for (const dir of escapedCurrentDirs) {
    message = message.replaceAll(dir, '')
  }
  const messsageList = message.replace(/\r\n/g, '\n').split('\n')
  return [
    messsageList[0], // start group
    ...messsageList.slice(1, -1).sort(),
    messsageList[messsageList.length - 1] // end group
  ]
}

it('should output', async () => {
  const root = new URL('./fixtures', import.meta.url)
  const { stdout } = await execa('npx', ['vitest'], {
    cwd: root,
    env: {
      ...process.env,
      CI: 'true',
      NO_COLOR: 'true'
    }
  }).catch(e => e)

  const message = formatMessage(stdout)
  expect(message).toMatchSnapshot()
}, 50000)
