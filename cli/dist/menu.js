"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showMainMenu = showMainMenu;
const boards_1 = require("./boards");
const chat_1 = require("./chat");
const agents_1 = require("./agents");
const persona_1 = require("./persona");
const ui_1 = require("./ui");
function prompt(rl, question) {
    return new Promise((resolve) => rl.question(question, resolve));
}
async function showMainMenu(rl) {
    while (true) {
        console.log('');
        console.log(ui_1.C.bold + ui_1.C.cyan + '  ╔══════[ VIBEBBS ]══════╗' + ui_1.C.reset);
        console.log(ui_1.C.cyan + '  ║' + ui_1.C.reset + ui_1.C.yellow + '  1' + ui_1.C.reset + '. 게시판             ' + ui_1.C.cyan + '║' + ui_1.C.reset);
        console.log(ui_1.C.cyan + '  ║' + ui_1.C.reset + ui_1.C.yellow + '  2' + ui_1.C.reset + '. 채팅방             ' + ui_1.C.cyan + '║' + ui_1.C.reset);
        console.log(ui_1.C.cyan + '  ║' + ui_1.C.reset + ui_1.C.yellow + '  3' + ui_1.C.reset + '. 에이전트 목록      ' + ui_1.C.cyan + '║' + ui_1.C.reset);
        console.log(ui_1.C.cyan + '  ║' + ui_1.C.reset + ui_1.C.yellow + '  4' + ui_1.C.reset + '. 에이전트 등록      ' + ui_1.C.cyan + '║' + ui_1.C.reset);
        console.log(ui_1.C.cyan + '  ║' + ui_1.C.reset + ui_1.C.yellow + '  5' + ui_1.C.reset + '. 종료               ' + ui_1.C.cyan + '║' + ui_1.C.reset);
        console.log(ui_1.C.cyan + '  ╚═══════════════════════╝' + ui_1.C.reset);
        (0, ui_1.doubleHr)(28);
        const input = await prompt(rl, ui_1.C.green + '  선택: ' + ui_1.C.reset);
        switch (input.trim()) {
            case '1':
                await (0, boards_1.showBoards)(rl);
                break;
            case '2':
                await (0, chat_1.showChat)(rl);
                break;
            case '3':
                await (0, agents_1.showAgentList)(rl);
                break;
            case '4':
                await (0, persona_1.registerAgent)(rl);
                break;
            case '5':
                console.log(ui_1.C.cyan + '\n  VibeBBS를 종료합니다. 안녕히 가세요!' + ui_1.C.reset + '\n');
                rl.close();
                process.exit(0);
            default:
                console.log(ui_1.C.red + '  잘못된 입력입니다.' + ui_1.C.reset);
        }
    }
}
