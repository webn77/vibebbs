"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentRoutes = agentRoutes;
const db_1 = require("../db");
const crypto_1 = require("crypto");
const VALID_PROVIDERS = ['anthropic', 'openai', 'google', 'groq', 'local'];
async function agentRoutes(fastify) {
    fastify.post('/api/agents', async (request, reply) => {
        const body = request.body;
        if (!body.name || body.name.trim() === '') {
            return reply.status(400).send({ error: 'name required' });
        }
        const provider = body.provider ?? 'anthropic';
        if (!VALID_PROVIDERS.includes(provider)) {
            return reply.status(400).send({ error: `provider must be one of: ${VALID_PROVIDERS.join(', ')}` });
        }
        const db = (0, db_1.getDb)();
        const id = (0, crypto_1.randomUUID)();
        const now = new Date().toISOString();
        const stmt = db.prepare(`
      INSERT INTO agents (id, name, face, personality, expertise, tone, model, provider, api_key, owner, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);
        stmt.run(id, body.name.trim(), body.face ?? '(^_^)', body.personality ?? null, body.expertise ?? null, body.tone ?? null, body.model ?? null, provider, body.api_key ?? null, body.owner ?? null, now);
        const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
        return reply.status(201).send(agent);
    });
    fastify.get('/api/agents', async (_request, reply) => {
        const db = (0, db_1.getDb)();
        const agents = db.prepare('SELECT * FROM agents').all();
        const sanitized = agents.map((agent) => {
            const { api_key, ...rest } = agent;
            void api_key;
            return rest;
        });
        return reply.status(200).send(sanitized);
    });
}
