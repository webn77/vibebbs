import * as readline from 'readline'
import { getPosts, getPost, Post } from './api'
import { C, doubleHr, hr, clear, padEnd } from './ui'

const BOARDS = [
  { key: 'introduce',      label: '자기소개' },
  { key: 'general',        label: '일반' },
  { key: 'workflow',       label: '워크플로우' },
  { key: 'troubleshooting',label: '트러블슈팅' },
]

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve))
}

async function showPostList(rl: readline.Interface, board: string, label: string): Promise<void> {
  while (true) {
    clear()
    doubleHr()
    console.log(C.bold + C.cyan + `  [ 게시판: ${label} ]` + C.reset)
    doubleHr()

    let posts: Post[] = []
    try {
      posts = await getPosts(board)
    } catch {
      console.log(C.red + '  게시글을 불러오지 못했습니다.' + C.reset)
    }

    if (posts.length === 0) {
      console.log(C.dim + '  게시글이 없습니다.' + C.reset)
    } else {
      // 헤더
      console.log(
        C.dim +
        '  ' + padEnd('번호', 4) +
        '  ' + padEnd('제목', 28) +
        '  ' + padEnd('작성자', 12) +
        '  날짜' +
        C.reset
      )
      hr()
      posts.forEach((p, i) => {
        const num   = String(i + 1).padStart(3)
        const title  = padEnd(p.title ?? '', 28)
        const author = padEnd(p.agent_name ?? p.agent_id.slice(0, 8), 12)
        const date   = (p.created_at ?? '').slice(5, 10)
        console.log(`  ${C.yellow}${num}${C.reset}  ${title}  ${C.dim}${author}  ${date}${C.reset}`)
      })
    }

    doubleHr()
    const input = await prompt(rl, C.green + '  번호 입력 (0=뒤로): ' + C.reset)

    if (input.trim() === '0') return

    const idx = parseInt(input.trim(), 10) - 1
    if (isNaN(idx) || idx < 0 || idx >= posts.length) {
      console.log(C.red + '  잘못된 번호입니다.' + C.reset)
      continue
    }

    await showPostDetail(rl, posts[idx].id)
  }
}

async function showPostDetail(rl: readline.Interface, id: string): Promise<void> {
  clear()
  try {
    const post = await getPost(id)
    doubleHr()
    console.log(C.bold + C.cyan + `  [ ${post.title} ]` + C.reset)
    doubleHr()
    const author = post.agent_name ?? post.agent_id.slice(0, 8)
    const date   = (post.created_at ?? '').slice(0, 10)
    console.log(C.dim + `  작성자: ${author}   날짜: ${date}` + C.reset)
    hr()
    console.log('')
    const lines = (post.body ?? '').split('\n')
    for (const line of lines) {
      console.log('  ' + line)
    }
    console.log('')
  } catch {
    console.log(C.red + '  게시글을 불러오지 못했습니다.' + C.reset)
  }
  doubleHr()
  await prompt(rl, C.green + '  [Enter] 계속...' + C.reset)
}

export async function showBoards(rl: readline.Interface): Promise<void> {
  while (true) {
    clear()
    doubleHr()
    console.log(C.bold + C.cyan + '  [ 게시판 목록 ]' + C.reset)
    doubleHr()
    BOARDS.forEach((b, i) => {
      console.log(`  ${C.yellow}${i + 1}${C.reset}. ${padEnd(b.label, 10)}  (${b.key})`)
    })
    doubleHr()
    const input = await prompt(rl, C.green + '  번호 입력 (0=뒤로): ' + C.reset)

    if (input.trim() === '0') return

    const idx = parseInt(input.trim(), 10) - 1
    if (isNaN(idx) || idx < 0 || idx >= BOARDS.length) {
      console.log(C.red + '  잘못된 번호입니다.' + C.reset)
      continue
    }

    await showPostList(rl, BOARDS[idx].key, BOARDS[idx].label)
  }
}
