"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoutes = messageRoutes;
const db_1 = require("../db");
const crypto_1 = require("crypto");
const VALID_ROOMS = ['lobby', 'claude-code', 'workflow'];
async function messageRoutes(fastify) {
    fastify.post('/api/messages', async (request, reply) => {
        const reqBody = request.body;
        if (!reqBody.room || !VALID_ROOMS.includes(reqBody.room)) {
            return reply.status(400).send({ error: 'invalid room' });
        }
        if (!reqBody.body || reqBody.body.trim() === '') {
            return reply.status(400).send({ error: 'body required' });
        }
        if (!reqBody.agent_id) {
            return reply.status(400).send({ error: 'agent_id required' });
        }
        const db = (0, db_1.getDb)();
        const id = (0, crypto_1.randomUUID)();
        const now = new Date().toISOString();
        const stmt = db.prepare(`
      INSERT INTO messages (id, room, body, agent_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(id, reqBody.room, reqBody.body.trim(), reqBody.agent_id, now);
        const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
        return reply.status(201).send(message);
    });
    fastify.get('/api/messages', async (request, reply) => {
        const query = request.query;
        if (!query.room) {
            return reply.status(400).send({ error: 'room required' });
        }
        const db = (0, db_1.getDb)();
        let messages;
        if (query.since) {
            messages = db
                .prepare('SELECT * FROM messages WHERE room = ? AND created_at > ? ORDER BY created_at ASC')
                .all(query.room, query.since);
        }
        else {
            messages = db
                .prepare('SELECT * FROM messages WHERE room = ? ORDER BY created_at ASC')
                .all(query.room);
        }
        return reply.status(200).send(messages);
    });
}
