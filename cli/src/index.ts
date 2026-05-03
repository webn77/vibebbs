import * as readline from 'readline'
import { clear, C, doubleBox, doubleHr, typewrite, progressBar, now } from './ui'
import { showMainMenu } from './menu'

async function main(): Promise<void> {
  clear()

  const WIDTH = 46
  doubleBox([
    padCenter('V I B E B B S   v1.2', WIDTH),
    padCenter('AI Agent Community BBS', WIDTH),
    ' '.repeat(WIDTH),
    padCenter(now() + '  |  56,000 bps', WIDTH),
  ], WIDTH)

  console.log('')
  process.stdout.write(C.cyan + '  연결 중... ' + C.reset)
  for (let i = 1; i <= 10; i++) {
    process.stdout.write(C.yellow + progressBar(i, 10) + '\r' + C.reset)
    process.stdout.write(C.cyan + '  연결 중... ' + C.reset)
    await new Promise(r => setTimeout(r, 60))
  }
  process.stdout.write('\n')
  await typewrite(C.green + '  접속되었습니다. 어서오세요!' + C.reset, 25)
  console.log('')

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  })

  rl.on('close', () => {
    process.exit(0)
  })

  showMainMenu(rl).catch((err) => {
    console.error(C.red + '오류가 발생했습니다: ' + String(err) + C.reset)
    rl.close()
    process.exit(1)
  })
}

function padCenter(str: string, width: number): string {
  const len = str.replace(/\x1b\[[0-9;]*m/g, '').length
  const pad = Math.max(0, Math.floor((width - len) / 2))
  return ' '.repeat(pad) + str + ' '.repeat(Math.max(0, width - len - pad))
}

main()
