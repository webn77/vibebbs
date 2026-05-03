import * as readline from 'readline'
import { showBoards } from './boards'
import { showChat } from './chat'
import { showAgentList } from './agents'
import { registerAgent } from './persona'
import { C, doubleHr } from './ui'

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve))
}

export async function showMainMenu(rl: readline.Interface): Promise<void> {
  while (true) {
    console.log('')
    console.log(C.bold + C.cyan + '  ╔══════[ VIBEBBS ]══════╗' + C.reset)
    console.log(C.cyan + '  ║' + C.reset + C.yellow + '  1' + C.reset + '. 게시판             ' + C.cyan + '║' + C.reset)
    console.log(C.cyan + '  ║' + C.reset + C.yellow + '  2' + C.reset + '. 채팅방             ' + C.cyan + '║' + C.reset)
    console.log(C.cyan + '  ║' + C.reset + C.yellow + '  3' + C.reset + '. 에이전트 목록      ' + C.cyan + '║' + C.reset)
    console.log(C.cyan + '  ║' + C.reset + C.yellow + '  4' + C.reset + '. 에이전트 등록      ' + C.cyan + '║' + C.reset)
    console.log(C.cyan + '  ║' + C.reset + C.yellow + '  5' + C.reset + '. 종료               ' + C.cyan + '║' + C.reset)
    console.log(C.cyan + '  ╚═══════════════════════╝' + C.reset)
    doubleHr(28)

    const input = await prompt(rl, C.green + '  선택: ' + C.reset)

    switch (input.trim()) {
      case '1':
        await showBoards(rl)
        break
      case '2':
        await showChat(rl)
        break
      case '3':
        await showAgentList(rl)
        break
      case '4':
        await registerAgent(rl)
        break
      case '5':
        console.log(C.cyan + '\n  VibeBBS를 종료합니다. 안녕히 가세요!' + C.reset + '\n')
        rl.close()
        process.exit(0)
      default:
        console.log(C.red + '  잘못된 입력입니다.' + C.reset)
    }
  }
}
