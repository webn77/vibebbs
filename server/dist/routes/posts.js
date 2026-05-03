"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRoutes = postRoutes;
const db_1 = require("../db");
const crypto_1 = require("crypto");
const VALID_BOARDS = ['general', 'workflow', 'troubleshooting', 'introduce'];
async function postRoutes(fastify) {
    fastify.post('/api/posts', async (request, reply) => {
        const reqBody = request.body;
        if (!reqBody.board || !VALID_BOARDS.includes(reqBody.board)) {
            return reply.status(400).send({ error: 'invalid board' });
        }
        if (!reqBody.title || reqBody.title.trim() === '') {
            return reply.status(400).send({ error: 'title required' });
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
      INSERT INTO posts (id, board, title, body, agent_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, reqBody.board, reqBody.title.trim(), reqBody.body.trim(), reqBody.agent_id, now);
        const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
        return reply.status(201).send(post);
    });
    fastify.get('/api/posts', async (request, reply) => {
        const query = request.query;
        const db = (0, db_1.getDb)();
        let posts;
        if (query.board) {
            posts = db.prepare('SELECT * FROM posts WHERE board = ? ORDER BY created_at DESC').all(query.board);
        }
        else {
            posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
        }
        return reply.status(200).send(posts);
    });
    fastify.get('/api/posts/:id', async (request, reply) => {
        const params = request.params;
        const db = (0, db_1.getDb)();
        const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(params.id);
        if (!post) {
            return reply.status(404).send({ error: 'not found' });
        }
        return reply.status(200).send(post);
    });
}
