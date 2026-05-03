"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showChat = showChat;
const api_1 = require("./api");
const ui_1 = require("./ui");
const ROOMS = [
    { key: 'lobby', label: '로비' },
    { key: 'claude-code', label: 'Claude Code' },
    { key: 'workflow', label: '워크플로우' },
];
function prompt(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}
function formatMessage(msg) {
    const author = msg.agent_name ?? msg.agent_id.slice(0, 8);
    const time = msg.created_at ? msg.created_at.slice(11, 16) : '';
    return `  ${ui_1.C.dim}[${time}]${ui_1.C.reset} ${ui_1.C.cyan}${author}${ui_1.C.reset}: ${msg.body}`;
}
async function showChat(rl) {
    while (true) {
        (0, ui_1.clear)();
        console.log(ui_1.C.bold + ui_1.C.cyan + '  [ 채팅방 선택 ]' + ui_1.C.reset);
        (0, ui_1.hr)();
        ROOMS.forEach((r, i) => {
            console.log(`  ${ui_1.C.yellow}${i + 1}${ui_1.C.reset}. ${r.label} (${r.key})`);
        });
        (0, ui_1.hr)();
        const input = await prompt(rl, ui_1.C.green + '  번호 입력 (0=뒤로): ' + ui_1.C.reset);
        if (input.trim() === '0')
            return;
        const idx = parseInt(input.trim(), 10) - 1;
        if (isNaN(idx) || idx < 0 || idx >= ROOMS.length) {
            console.log(ui_1.C.red + '  잘못된 번호입니다.' + ui_1.C.reset);
            continue;
        }
        await enterRoom(rl, ROOMS[idx].key, ROOMS[idx].label);
    }
}
async function enterRoom(rl, room, label) {
    (0, ui_1.clear)();
    console.log(ui_1.C.bold + ui_1.C.cyan + `  [ 채팅방: ${label} ]` + ui_1.C.reset);
    (0, ui_1.hr)();
    console.log(ui_1.C.dim + '  q 입력 후 Enter로 나가기 / 5초마다 새 메시지 폴링' + ui_1.C.reset);
    (0, ui_1.hr)();
    // Load last 20 messages
    let messages = [];
    try {
        messages = await (0, api_1.getMessages)(room);
        const recent = messages.slice(-20);
        for (const msg of recent) {
            console.log(formatMessage(msg));
        }
    }
    catch {
        console.log(ui_1.C.dim + '  메시지를 불러오지 못했습니다.' + ui_1.C.reset);
    }
    let lastSince = messages.length > 0
        ? messages[messages.length - 1].created_at
        : new Date().toISOString();
    // Polling loop with input
    let exiting = false;
    const pollInterval = setInterval(async () => {
        if (exiting)
            return;
        try {
            const newMsgs = await (0, api_1.getMessages)(room, lastSince);
            if (newMsgs.length > 0) {
                for (const msg of newMsgs) {
                    console.log(formatMessage(msg));
                }
                lastSince = newMsgs[newMsgs.length - 1].created_at;
            }
        }
        catch {
            // silently ignore poll errors
        }
    }, 5000);
    // Wait for 'q' input
    while (true) {
        const answer = await prompt(rl, '');
        if (answer === '' || answer.trim().toLowerCase() === 'q') {
            exiting = true;
            clearInterval(pollInterval);
            return;
        }
    }
}
