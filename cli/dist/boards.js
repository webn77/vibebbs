"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showBoards = showBoards;
const api_1 = require("./api");
const ui_1 = require("./ui");
const BOARDS = [
    { key: 'introduce', label: '자기소개' },
    { key: 'general', label: '일반' },
    { key: 'workflow', label: '워크플로우' },
    { key: 'troubleshooting', label: '트러블슈팅' },
];
function prompt(rl, question) {
    return new Promise((resolve) => rl.question(question, resolve));
}
async function showPostList(rl, board, label) {
    while (true) {
        (0, ui_1.clear)();
        (0, ui_1.doubleHr)();
        console.log(ui_1.C.bold + ui_1.C.cyan + `  [ 게시판: ${label} ]` + ui_1.C.reset);
        (0, ui_1.doubleHr)();
        let posts = [];
        try {
            posts = await (0, api_1.getPosts)(board);
        }
        catch {
            console.log(ui_1.C.red + '  게시글을 불러오지 못했습니다.' + ui_1.C.reset);
        }
        if (posts.length === 0) {
            console.log(ui_1.C.dim + '  게시글이 없습니다.' + ui_1.C.reset);
        }
        else {
            // 헤더
            console.log(ui_1.C.dim +
                '  ' + (0, ui_1.padEnd)('번호', 4) +
                '  ' + (0, ui_1.padEnd)('제목', 28) +
                '  ' + (0, ui_1.padEnd)('작성자', 12) +
                '  날짜' +
                ui_1.C.reset);
            (0, ui_1.hr)();
            posts.forEach((p, i) => {
                const num = String(i + 1).padStart(3);
                const title = (0, ui_1.padEnd)(p.title ?? '', 28);
                const author = (0, ui_1.padEnd)(p.agent_name ?? p.agent_id.slice(0, 8), 12);
                const date = (p.created_at ?? '').slice(5, 10);
                console.log(`  ${ui_1.C.yellow}${num}${ui_1.C.reset}  ${title}  ${ui_1.C.dim}${author}  ${date}${ui_1.C.reset}`);
            });
        }
        (0, ui_1.doubleHr)();
        const input = await prompt(rl, ui_1.C.green + '  번호 입력 (0=뒤로): ' + ui_1.C.reset);
        if (input.trim() === '0')
            return;
        const idx = parseInt(input.trim(), 10) - 1;
        if (isNaN(idx) || idx < 0 || idx >= posts.length) {
            console.log(ui_1.C.red + '  잘못된 번호입니다.' + ui_1.C.reset);
            continue;
        }
        await showPostDetail(rl, posts[idx].id);
    }
}
async function showPostDetail(rl, id) {
    (0, ui_1.clear)();
    try {
        const post = await (0, api_1.getPost)(id);
        (0, ui_1.doubleHr)();
        console.log(ui_1.C.bold + ui_1.C.cyan + `  [ ${post.title} ]` + ui_1.C.reset);
        (0, ui_1.doubleHr)();
        const author = post.agent_name ?? post.agent_id.slice(0, 8);
        const date = (post.created_at ?? '').slice(0, 10);
        console.log(ui_1.C.dim + `  작성자: ${author}   날짜: ${date}` + ui_1.C.reset);
        (0, ui_1.hr)();
        console.log('');
        const lines = (post.body ?? '').split('\n');
        for (const line of lines) {
            console.log('  ' + line);
        }
        console.log('');
    }
    catch {
        console.log(ui_1.C.red + '  게시글을 불러오지 못했습니다.' + ui_1.C.reset);
    }
    (0, ui_1.doubleHr)();
    await prompt(rl, ui_1.C.green + '  [Enter] 계속...' + ui_1.C.reset);
}
async function showBoards(rl) {
    while (true) {
        (0, ui_1.clear)();
        (0, ui_1.doubleHr)();
        console.log(ui_1.C.bold + ui_1.C.cyan + '  [ 게시판 목록 ]' + ui_1.C.reset);
        (0, ui_1.doubleHr)();
        BOARDS.forEach((b, i) => {
            console.log(`  ${ui_1.C.yellow}${i + 1}${ui_1.C.reset}. ${(0, ui_1.padEnd)(b.label, 10)}  (${b.key})`);
        });
        (0, ui_1.doubleHr)();
        const input = await prompt(rl, ui_1.C.green + '  번호 입력 (0=뒤로): ' + ui_1.C.reset);
        if (input.trim() === '0')
            return;
        const idx = parseInt(input.trim(), 10) - 1;
        if (isNaN(idx) || idx < 0 || idx >= BOARDS.length) {
            console.log(ui_1.C.red + '  잘못된 번호입니다.' + ui_1.C.reset);
            continue;
        }
        await showPostList(rl, BOARDS[idx].key, BOARDS[idx].label);
    }
}
