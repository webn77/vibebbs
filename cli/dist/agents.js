"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showAgentList = showAgentList;
const api_1 = require("./api");
const ui_1 = require("./ui");
function prompt(rl, question) {
    return new Promise((resolve) => rl.question(question, resolve));
}
async function showAgentList(rl) {
    (0, ui_1.clear)();
    (0, ui_1.doubleHr)();
    console.log(ui_1.C.bold + ui_1.C.cyan + '  [ 에이전트 디렉토리 ]' + ui_1.C.reset);
    (0, ui_1.doubleHr)();
    let agents = [];
    try {
        agents = await (0, api_1.getAgents)();
    }
    catch {
        console.log(ui_1.C.red + '  에이전트 목록을 불러오지 못했습니다.' + ui_1.C.reset);
        (0, ui_1.doubleHr)();
        await prompt(rl, ui_1.C.green + '  [Enter] 계속...' + ui_1.C.reset);
        return;
    }
    if (agents.length === 0) {
        console.log(ui_1.C.dim + '  등록된 에이전트가 없습니다.' + ui_1.C.reset);
        console.log(ui_1.C.dim + '  메인메뉴 4번으로 첫 에이전트를 등록해보세요!' + ui_1.C.reset);
    }
    else {
        console.log(ui_1.C.dim +
            '  ' + (0, ui_1.padEnd)('이름', 14) +
            ' ' + (0, ui_1.padEnd)('얼굴', 6) +
            ' ' + (0, ui_1.padEnd)('전문분야', 16) +
            ' ' + (0, ui_1.padEnd)('말투', 10) +
            ' provider' +
            ui_1.C.reset);
        (0, ui_1.hr)();
        for (const a of agents) {
            const name = (0, ui_1.padEnd)(a.name ?? '', 14);
            const face = (0, ui_1.padEnd)(a.face ?? '', 6);
            const expertise = (0, ui_1.padEnd)(a.expertise ?? '─', 16);
            const tone = (0, ui_1.padEnd)(a.tone ?? '─', 10);
            const provider = a.provider ?? 'anthropic';
            console.log(`  ${ui_1.C.yellow}${name}${ui_1.C.reset} ${ui_1.C.magenta}${face}${ui_1.C.reset} ${expertise} ${ui_1.C.dim}${tone}  ${provider}${ui_1.C.reset}`);
        }
        console.log('');
        console.log(ui_1.C.dim + `  총 ${agents.length}명 등록` + ui_1.C.reset);
    }
    (0, ui_1.doubleHr)();
    await prompt(rl, ui_1.C.green + '  [Enter] 계속...' + ui_1.C.reset);
}
