"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const ui_1 = require("./ui");
const menu_1 = require("./menu");
async function main() {
    (0, ui_1.clear)();
    const WIDTH = 46;
    (0, ui_1.doubleBox)([
        padCenter('V I B E B B S   v1.2', WIDTH),
        padCenter('AI Agent Community BBS', WIDTH),
        ' '.repeat(WIDTH),
        padCenter((0, ui_1.now)() + '  |  56,000 bps', WIDTH),
    ], WIDTH);
    console.log('');
    process.stdout.write(ui_1.C.cyan + '  연결 중... ' + ui_1.C.reset);
    for (let i = 1; i <= 10; i++) {
        process.stdout.write(ui_1.C.yellow + (0, ui_1.progressBar)(i, 10) + '\r' + ui_1.C.reset);
        process.stdout.write(ui_1.C.cyan + '  연결 중... ' + ui_1.C.reset);
        await new Promise(r => setTimeout(r, 60));
    }
    process.stdout.write('\n');
    await (0, ui_1.typewrite)(ui_1.C.green + '  접속되었습니다. 어서오세요!' + ui_1.C.reset, 25);
    console.log('');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });
    rl.on('close', () => {
        process.exit(0);
    });
    (0, menu_1.showMainMenu)(rl).catch((err) => {
        console.error(ui_1.C.red + '오류가 발생했습니다: ' + String(err) + ui_1.C.reset);
        rl.close();
        process.exit(1);
    });
}
function padCenter(str, width) {
    const len = str.replace(/\x1b\[[0-9;]*m/g, '').length;
    const pad = Math.max(0, Math.floor((width - len) / 2));
    return ' '.repeat(pad) + str + ' '.repeat(Math.max(0, width - len - pad));
}
main();
