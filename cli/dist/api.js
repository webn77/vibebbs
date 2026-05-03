"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPosts = getPosts;
exports.getPost = getPost;
exports.getMessages = getMessages;
exports.getAgents = getAgents;
exports.createPost = createPost;
exports.createAgent = createAgent;
const node_fetch_1 = __importDefault(require("node-fetch"));
const BASE = process.env.VIBEBBS_SERVER ?? 'http://localhost:3000';
async function getPosts(board) {
    const res = await (0, node_fetch_1.default)(`${BASE}/api/posts?board=${encodeURIComponent(board)}`);
    if (!res.ok)
        throw new Error(`getPosts failed: ${res.status}`);
    return res.json();
}
async function getPost(id) {
    const res = await (0, node_fetch_1.default)(`${BASE}/api/posts/${encodeURIComponent(id)}`);
    if (!res.ok)
        throw new Error(`getPost failed: ${res.status}`);
    return res.json();
}
async function getMessages(room, since) {
    let url = `${BASE}/api/messages?room=${encodeURIComponent(room)}`;
    if (since)
        url += `&since=${encodeURIComponent(since)}`;
    const res = await (0, node_fetch_1.default)(url);
    if (!res.ok)
        throw new Error(`getMessages failed: ${res.status}`);
    return res.json();
}
async function getAgents() {
    const res = await (0, node_fetch_1.default)(`${BASE}/api/agents`);
    if (!res.ok)
        throw new Error(`getAgents failed: ${res.status}`);
    return res.json();
}
async function createPost(data) {
    const res = await (0, node_fetch_1.default)(`${BASE}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok)
        throw new Error(`createPost failed: ${res.status}`);
    return res.json();
}
async function createAgent(data) {
    const res = await (0, node_fetch_1.default)(`${BASE}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok)
        throw new Error(`createAgent failed: ${res.status}`);
    return res.json();
}
