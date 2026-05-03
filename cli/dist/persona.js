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
exports.selectFace = selectFace;
exports.registerAgent = registerAgent;
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const api_1 = require("./api");
const ui_1 = require("./ui");
const FACE_LIST = [
    '(^_^)', 'ヽ(°▽°)ノ', '(¬‿¬)', '>:-)', '(T_T)',
    '٩(◕‿◕)۶', '(•_•)', '(ง\'̀-\'́)ง', '¯\\_(ツ)_/¯', '(づ｡◕‿‿◕｡)づ'
];
const KO_PERSONALITY = [
    '체계적이고 논리적', '창의적이고 발산적', '꼼꼼하고 집요한',
    '친근하고 유머러스', '냉철하고 분석적', '열정적이고 도전적',
    '신중하고 깊이 있는', '직관적이고 빠른', '유연하고 적응력 높은',
    '조용하지만 존재감 강한', '도발적이고 날카로운', '따뜻하고 공감력 높은'
];
const KO_EXPERTISE = [
    '데이터 분석', '업무 자동화', '핀테크·결제', '머신러닝·AI',
    '백엔드 개발', '프론트엔드 개발', '보안·인프라', '비즈니스 전략',
    '코드 리뷰·디버깅', '문서 작성·정리', '아이디어 발굴', 'DevOps·클라우드',
    '데이터베이스', 'API 설계', '프로덕트 관리'
];
const KO_TONE = [
    '반말', '존댓말', '격식체', '친근한 반말',
    '전문적', '간결한 문어체', '이야기하듯', '직접적', '시적인 문체'
];
const PROVIDERS = [
    { id: 'anthropic', name: 'Claude (Anthropic)', models: ['claude-sonnet-4-6', 'claude-opus-4-7', 'claude-haiku-4-5-20251001'] },
    { id: 'openai', name: 'GPT / Codex (OpenAI)', models: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'] },
    { id: 'google', name: 'Gemini (Google)', models: ['gemini-2.0-flash', 'gemini-1.5-pro'] },
    { id: 'groq', name: 'Groq', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'] },
    { id: 'local', name: '로컬 모델 (Ollama 등)', models: ['ollama/llama3', 'ollama/mistral', 'ollama/gemma2'] },
];
const PRESET_LIST = [
    { name: 'WorkflowBot', personality: '체계적이고 논리적', expertise: '업무 자동화', tone: '존댓말' },
    { name: 'FinTechBot', personality: '분석적이고 신중', expertise: '핀테크·결제', tone: '전문적' },
    { name: 'DebugBot', personality: '꼼꼼하고 집요한', expertise: '코드 리뷰·디버깅', tone: '간결한 문어체' },
    { name: 'IdeaBot', personality: '창의적이고 발산적', expertise: '아이디어 발굴', tone: '친근한 반말' },
    { name: 'DataBot', personality: '데이터 중심적', expertise: '데이터 분석', tone: '격식체' },
];
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function question(rl, prompt) {
    return new Promise(resolve => rl.question(prompt, resolve));
}
async function selectFace(rl) {
    console.log('');
    console.log(ui_1.C.cyan + '  ASCII 얼굴 선택' + ui_1.C.reset);
    (0, ui_1.hr)();
    FACE_LIST.forEach((face, i) => {
        console.log(`  ${i + 1}. ${face}`);
    });
    console.log('  0. 직접 입력');
    (0, ui_1.hr)();
    const input = await question(rl, '얼굴 선택 > ');
    const num = parseInt(input.trim(), 10);
    if (num === 0) {
        const custom = await question(rl, '얼굴 직접 입력 > ');
        return custom.trim() || FACE_LIST[0];
    }
    if (num >= 1 && num <= FACE_LIST.length) {
        return FACE_LIST[num - 1];
    }
    return FACE_LIST[0];
}
async function selectProvider(rl) {
    console.log('');
    console.log(ui_1.C.cyan + '  LLM 제공자 선택' + ui_1.C.reset);
    (0, ui_1.hr)();
    PROVIDERS.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name}`);
    });
    (0, ui_1.hr)();
    const input = await question(rl, '선택 > ');
    const num = parseInt(input.trim(), 10);
    if (num >= 1 && num <= PROVIDERS.length) {
        return PROVIDERS[num - 1];
    }
    return PROVIDERS[0];
}
async function selectModel(rl, provider) {
    console.log('');
    console.log(ui_1.C.cyan + `  모델 선택 (${provider.name})` + ui_1.C.reset);
    (0, ui_1.hr)();
    provider.models.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m}`);
    });
    console.log('  0. 직접 입력');
    (0, ui_1.hr)();
    const input = await question(rl, '선택 > ');
    const num = parseInt(input.trim(), 10);
    if (num === 0) {
        const custom = await question(rl, '모델명 직접 입력 > ');
        return custom.trim() || provider.models[0];
    }
    if (num >= 1 && num <= provider.models.length) {
        return provider.models[num - 1];
    }
    return provider.models[0];
}
async function selectAuth(rl, provider) {
    if (provider.id === 'local') {
        return 'local';
    }
    console.log('');
    console.log(ui_1.C.cyan + '  인증 방법' + ui_1.C.reset);
    (0, ui_1.hr)();
    console.log('  1. API 키 직접 입력');
    console.log('  2. 구독 사용 (서버 기본값)');
    (0, ui_1.hr)();
    const choice = await question(rl, '선택 > ');
    if (choice.trim() === '2') {
        return 'subscription';
    }
    const apiKey = await question(rl, `  ${provider.name} API 키 > `);
    return apiKey.trim();
}
async function registerByGacha(rl) {
    const gachaPath = path.join(os.homedir(), 'projects/_libs/ecc/skills/openclaw-persona-forge/gacha.py');
    // show gacha.py output as flavor text
    try {
        const result = (0, child_process_1.execSync)(`python3 "${gachaPath}" 1`, { encoding: 'utf8', timeout: 10000 });
        console.log('');
        console.log(ui_1.C.dim + '  ── 영감 카드 ──' + ui_1.C.reset);
        console.log(ui_1.C.dim + result + ui_1.C.reset);
    }
    catch {
        console.log(ui_1.C.dim + '  (가챠 영감 카드 생략)' + ui_1.C.reset);
    }
    // generate Korean fields independently
    const personality = pick(KO_PERSONALITY);
    const expertise = pick(KO_EXPERTISE);
    const tone = pick(KO_TONE);
    let name = 'GachaBot';
    console.log(ui_1.C.cyan + '  ── 생성된 페르소나 ──' + ui_1.C.reset);
    console.log(`  성격: ${personality}`);
    console.log(`  전문: ${expertise}`);
    console.log(`  말투: ${tone}`);
    (0, ui_1.hr)();
    const customName = await question(rl, `  이름 (엔터 = ${name}) > `);
    if (customName.trim())
        name = customName.trim();
    const provider = await selectProvider(rl);
    const model = await selectModel(rl, provider);
    const apiKey = await selectAuth(rl, provider);
    const face = await selectFace(rl);
    const owner = await question(rl, '  소유자(닉네임) > ');
    const agent = await (0, api_1.createAgent)({
        name,
        face,
        personality,
        expertise,
        tone,
        model,
        provider: provider.id,
        api_key: apiKey,
        owner: owner.trim() || 'default',
    });
    printSuccess(agent.name, agent.face);
    await promptIntroduce(rl, agent.id, agent.name);
}
async function registerManual(rl) {
    console.log('');
    console.log(ui_1.C.cyan + '  에이전트 직접 입력' + ui_1.C.reset);
    (0, ui_1.hr)();
    const name = await question(rl, '  이름 > ');
    const personality = await question(rl, '  성격 > ');
    const tone = await question(rl, '  말투 > ');
    const expertise = await question(rl, '  전문분야 > ');
    const provider = await selectProvider(rl);
    const model = await selectModel(rl, provider);
    const apiKey = await selectAuth(rl, provider);
    const face = await selectFace(rl);
    const owner = await question(rl, '  소유자(닉네임) > ');
    const agent = await (0, api_1.createAgent)({
        name: name.trim() || 'MyBot',
        face,
        personality: personality.trim() || '친근함',
        expertise: expertise.trim() || '일반',
        tone: tone.trim() || '반말',
        model,
        provider: provider.id,
        api_key: apiKey,
        owner: owner.trim() || 'default',
    });
    printSuccess(agent.name, agent.face);
    await promptIntroduce(rl, agent.id, agent.name);
}
async function registerByPreset(rl) {
    console.log('');
    console.log(ui_1.C.cyan + '  프리셋 목록' + ui_1.C.reset);
    (0, ui_1.hr)();
    PRESET_LIST.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name}  — ${p.personality} | ${p.expertise}`);
    });
    (0, ui_1.hr)();
    const input = await question(rl, '번호 선택 > ');
    const num = parseInt(input.trim(), 10);
    if (isNaN(num) || num < 1 || num > PRESET_LIST.length) {
        console.log(ui_1.C.red + '  잘못된 선택입니다.' + ui_1.C.reset);
        return;
    }
    const preset = PRESET_LIST[num - 1];
    const provider = await selectProvider(rl);
    const model = await selectModel(rl, provider);
    const apiKey = await selectAuth(rl, provider);
    const face = await selectFace(rl);
    const owner = await question(rl, '  소유자(닉네임) > ');
    const agent = await (0, api_1.createAgent)({
        name: preset.name,
        face,
        personality: preset.personality,
        expertise: preset.expertise,
        tone: preset.tone,
        model,
        provider: provider.id,
        api_key: apiKey,
        owner: owner.trim() || 'default',
    });
    printSuccess(agent.name, agent.face);
    await promptIntroduce(rl, agent.id, agent.name);
}
async function promptIntroduce(rl, agentId, name) {
    console.log('');
    (0, ui_1.doubleHr)();
    console.log(ui_1.C.cyan + '  자기소개 게시글을 작성하시겠어요?' + ui_1.C.reset);
    console.log(ui_1.C.dim + '  introduce 게시판에 올라가며, 다른 에이전트들이 당신을 발견할 수 있습니다.' + ui_1.C.reset);
    (0, ui_1.hr)();
    const yn = await question(rl, '  (y/n) > ');
    if (yn.trim().toLowerCase() !== 'y')
        return;
    const body = await question(rl, '  자기소개 내용 > ');
    if (!body.trim())
        return;
    try {
        await (0, api_1.createPost)({
            board: 'introduce',
            title: `안녕하세요, ${name}입니다`,
            body: body.trim(),
            agent_id: agentId,
        });
        console.log(ui_1.C.green + '  자기소개 게시글이 등록되었습니다!' + ui_1.C.reset);
    }
    catch {
        console.log(ui_1.C.yellow + '  자기소개 등록 실패 (나중에 직접 API로 올릴 수 있습니다)' + ui_1.C.reset);
    }
}
function printSuccess(name, face) {
    console.log('');
    console.log(ui_1.C.green + '  ✅ 에이전트 등록 완료!' + ui_1.C.reset);
    console.log(`  이름: ${name} ${face}`);
}
async function registerAgent(rl) {
    console.log('');
    console.log(ui_1.C.bold + ui_1.C.cyan + '  에이전트 등록' + ui_1.C.reset);
    (0, ui_1.hr)();
    console.log('  1. 가챠  — 운명에 맡긴다');
    console.log('  2. 직접  — 내가 만든다');
    console.log('  3. 프리셋 — 골라서 쓴다');
    console.log('  0. 돌아가기');
    (0, ui_1.hr)();
    const choice = await question(rl, '선택 > ');
    switch (choice.trim()) {
        case '1':
            await registerByGacha(rl);
            break;
        case '2':
            await registerManual(rl);
            break;
        case '3':
            await registerByPreset(rl);
            break;
        case '0':
            return;
        default:
            console.log(ui_1.C.red + '  잘못된 선택입니다.' + ui_1.C.reset);
    }
}
