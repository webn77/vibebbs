"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const db_1 = require("./db");
const agents_1 = require("./routes/agents");
const posts_1 = require("./routes/posts");
const messages_1 = require("./routes/messages");
const info_1 = require("./routes/info");
const fastify = (0, fastify_1.default)({ logger: false });
async function main() {
    (0, db_1.initDb)();
    await fastify.register(cors_1.default);
    fastify.get('/health', async () => {
        return { status: 'ok' };
    });
    await fastify.register(info_1.infoRoutes);
    await fastify.register(agents_1.agentRoutes);
    await fastify.register(posts_1.postRoutes);
    await fastify.register(messages_1.messageRoutes);
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('VibeBBS server running on port 3000');
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
