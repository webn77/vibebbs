"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.C = void 0;
exports.clear = clear;
exports.displayWidth = displayWidth;
exports.padEnd = padEnd;
exports.doubleHr = doubleHr;
exports.hr = hr;
exports.doubleBox = doubleBox;
exports.box = box;
exports.typewrite = typewrite;
exports.progressBar = progressBar;
exports.now = now;
exports.C = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    magenta: '\x1b[35m',
    white: '\x1b[37m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
};
function clear() {
    process.stdout.write('\x1bc');
}
// CJK 문자는 터미널에서 2칸 차지 — 정렬 보정용
function displayWidth(str) {
    let w = 0;
    for (const ch of str) {
        const code = ch.codePointAt(0) ?? 0;
        w += (code >= 0x1100 && (code <= 0x115F ||
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
            (code >= 0x1F900 && code <= 0x1FA9F))) ? 2 : 1;
    }
    return w;
}
// 표시 너비 기준 padEnd
function padEnd(str, width, fill = ' ') {
    const dw = displayWidth(str);
    const pad = Math.max(0, width - dw);
    return str + fill.repeat(pad);
}
// 이중선 구분선
function doubleHr(width = 50) {
    console.log(exports.C.cyan + '═'.repeat(width) + exports.C.reset);
}
// 단선 구분선
function hr(width = 50) {
    console.log(exports.C.dim + '─'.repeat(width) + exports.C.reset);
}
// 이중선 박스 (╔╗╚╝║═)
function doubleBox(lines, width) {
    const inner = width ?? lines.reduce((max, l) => Math.max(max, displayWidth(l)), 0);
    const top = '╔' + '═'.repeat(inner + 2) + '╗';
    const bottom = '╚' + '═'.repeat(inner + 2) + '╝';
    console.log(exports.C.cyan + top + exports.C.reset);
    for (const line of lines) {
        const pad = ' '.repeat(inner - displayWidth(line));
        console.log(exports.C.cyan + '║ ' + exports.C.reset + line + pad + exports.C.cyan + ' ║' + exports.C.reset);
    }
    console.log(exports.C.cyan + bottom + exports.C.reset);
}
// 레거시 단선 박스 (하위 호환)
function box(lines) {
    doubleBox(lines);
}
// 타이핑 효과
async function typewrite(text, delayMs = 30) {
    for (const ch of text) {
        process.stdout.write(ch);
        await new Promise(r => setTimeout(r, delayMs));
    }
    process.stdout.write('\n');
}
// 프로그레스바 즉시 출력
function progressBar(filled, total, width = 10) {
    const f = Math.round((filled / total) * width);
    return '■'.repeat(f) + '□'.repeat(width - f);
}
// 현재 날짜·시간 문자열
function now() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
