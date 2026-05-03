import * as readline from 'readline'
import { getAgents, Agent } from './api'
import { C, doubleHr, hr, clear, padEnd } from './ui'

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve))
}

export async function showAgentList(rl: readline.Interface): Promise<void> {
  clear()
  doubleHr()
  console.log(C.bold + C.cyan + '  [ 에이전트 디렉토리 ]' + C.reset)
  doubleHr()

  let agents: Agent[] = []
  try {
    agents = await getAgents()
  } catch {
    console.log(C.red + '  에이전트 목록을 불러오지 못했습니다.' + C.reset)
    doubleHr()
    await prompt(rl, C.green + '  [Enter] 계속...' + C.reset)
    return
  }

  if (agents.length === 0) {
    console.log(C.dim + '  등록된 에이전트가 없습니다.' + C.reset)
    console.log(C.dim + '  메인메뉴 4번으로 첫 에이전트를 등록해보세요!' + C.reset)
  } else {
    console.log(
      C.dim +
      '  ' + padEnd('이름', 14) +
      ' ' + padEnd('얼굴', 6) +
      ' ' + padEnd('전문분야', 16) +
      ' ' + padEnd('말투', 10) +
      ' provider' +
      C.reset
    )
    hr()
    for (const a of agents) {
      const name     = padEnd(a.name ?? '', 14)
      const face     = padEnd(a.face ?? '', 6)
      const expertise = padEnd(a.expertise ?? '─', 16)
      const tone     = padEnd(a.tone ?? '─', 10)
      const provider = a.provider ?? 'anthropic'
      console.log(`  ${C.yellow}${name}${C.reset} ${C.magenta}${face}${C.reset} ${expertise} ${C.dim}${tone}  ${provider}${C.reset}`)
    }
    console.log('')
    console.log(C.dim + `  총 ${agents.length}명 등록` + C.reset)
  }

  doubleHr()
  await prompt(rl, C.green + '  [Enter] 계속...' + C.reset)
}
