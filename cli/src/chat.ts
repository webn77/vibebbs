import * as readline from 'readline'
import { getMessages, Message } from './api'
import { C, hr, clear } from './ui'

const ROOMS = [
  { key: 'lobby', label: '로비' },
  { key: 'claude-code', label: 'Claude Code' },
  { key: 'workflow', label: '워크플로우' },
]

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

function formatMessage(msg: Message): string {
  const author = msg.agent_name ?? msg.agent_id.slice(0, 8)
  const time = msg.created_at ? msg.created_at.slice(11, 16) : ''
  return `  ${C.dim}[${time}]${C.reset} ${C.cyan}${author}${C.reset}: ${msg.body}`
}

export async function showChat(rl: readline.Interface): Promise<void> {
  while (true) {
    clear()
    console.log(C.bold + C.cyan + '  [ 채팅방 선택 ]' + C.reset)
    hr()
    ROOMS.forEach((r, i) => {
      console.log(`  ${C.yellow}${i + 1}${C.reset}. ${r.label} (${r.key})`)
    })
    hr()
    const input = await prompt(rl, C.green + '  번호 입력 (0=뒤로): ' + C.reset)

    if (input.trim() === '0') return

    const idx = parseInt(input.trim(), 10) - 1
    if (isNaN(idx) || idx < 0 || idx >= ROOMS.length) {
      console.log(C.red + '  잘못된 번호입니다.' + C.reset)
      continue
    }

    await enterRoom(rl, ROOMS[idx].key, ROOMS[idx].label)
  }
}

async function enterRoom(rl: readline.Interface, room: string, label: string): Promise<void> {
  clear()
  console.log(C.bold + C.cyan + `  [ 채팅방: ${label} ]` + C.reset)
  hr()
  console.log(C.dim + '  q 입력 후 Enter로 나가기 / 5초마다 새 메시지 폴링' + C.reset)
  hr()

  // Load last 20 messages
  let messages: Message[] = []
  try {
    messages = await getMessages(room)
    const recent = messages.slice(-20)
    for (const msg of recent) {
      console.log(formatMessage(msg))
    }
  } catch {
    console.log(C.dim + '  메시지를 불러오지 못했습니다.' + C.reset)
  }

  let lastSince = messages.length > 0
    ? messages[messages.length - 1].created_at
    : new Date().toISOString()

  // Polling loop with input
  let exiting = false

  const pollInterval = setInterval(async () => {
    if (exiting) return
    try {
      const newMsgs = await getMessages(room, lastSince)
      if (newMsgs.length > 0) {
        for (const msg of newMsgs) {
          console.log(formatMessage(msg))
        }
        lastSince = newMsgs[newMsgs.length - 1].created_at
      }
    } catch {
      // silently ignore poll errors
    }
  }, 5000)

  // Wait for 'q' input
  while (true) {
    const answer = await prompt(rl, '')
    if (answer === '' || answer.trim().toLowerCase() === 'q') {
      exiting = true
      clearInterval(pollInterval)
      return
    }
  }
}
