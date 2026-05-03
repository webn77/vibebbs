export const C = {
  reset:   '\x1b[0m',
  cyan:    '\x1b[36m',
  yellow:  '\x1b[33m',
  green:   '\x1b[32m',
  red:     '\x1b[31m',
  magenta: '\x1b[35m',
  white:   '\x1b[37m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
}

export function clear(): void {
  process.stdout.write('\x1bc')
}

// CJK 문자는 터미널에서 2칸 차지 — 정렬 보정용
export function displayWidth(str: string): number {
  let w = 0
  for (const ch of str) {
    const code = ch.codePointAt(0) ?? 0
    w += (code >= 0x1100 && (
      code <= 0x115F ||
      code === 0x2329 || code === 0x232A ||
      (code >= 0x2E80 && code <= 0x303E) ||
      (code >= 0x3040 && code <= 0xA4CF) ||
      (code >= 0xAC00 && code <= 0xD7A3) ||
      (code >= 0xF900 && code <= 0xFAFF) ||
      (code >= 0xFE10 && code <= 0xFE1F) ||
      (code >= 0xFE30 && code <= 0xFE4F) ||
      (code >= 0xFF00 && code <= 0xFF60) ||
      (code >= 0xFFE0 && code <= 0xFFE6) ||
      (code >= 0x1F300 && code <= 0x1F64F) ||
      (code >= 0x1F900 && code <= 0x1FA9F)
    )) ? 2 : 1
  }
  return w
}

// 표시 너비 기준 padEnd
export function padEnd(str: string, width: number, fill = ' '): string {
  const dw = displayWidth(str)
  const pad = Math.max(0, width - dw)
  return str + fill.repeat(pad)
}

// 이중선 구분선
export function doubleHr(width = 50): void {
  console.log(C.cyan + '═'.repeat(width) + C.reset)
}

// 단선 구분선
export function hr(width = 50): void {
  console.log(C.dim + '─'.repeat(width) + C.reset)
}

// 이중선 박스 (╔╗╚╝║═)
export function doubleBox(lines: string[], width?: number): void {
  const inner = width ?? lines.reduce((max, l) => Math.max(max, displayWidth(l)), 0)
  const top    = '╔' + '═'.repeat(inner + 2) + '╗'
  const bottom = '╚' + '═'.repeat(inner + 2) + '╝'

  console.log(C.cyan + top + C.reset)
  for (const line of lines) {
    const pad = ' '.repeat(inner - displayWidth(line))
    console.log(C.cyan + '║ ' + C.reset + line + pad + C.cyan + ' ║' + C.reset)
  }
  console.log(C.cyan + bottom + C.reset)
}

// 레거시 단선 박스 (하위 호환)
export function box(lines: string[]): void {
  doubleBox(lines)
}

// 타이핑 효과
export async function typewrite(text: string, delayMs = 30): Promise<void> {
  for (const ch of text) {
    process.stdout.write(ch)
    await new Promise(r => setTimeout(r, delayMs))
  }
  process.stdout.write('\n')
}

// 프로그레스바 즉시 출력
export function progressBar(filled: number, total: number, width = 10): string {
  const f = Math.round((filled / total) * width)
  return '■'.repeat(f) + '□'.repeat(width - f)
}

// 현재 날짜·시간 문자열
export function now(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
