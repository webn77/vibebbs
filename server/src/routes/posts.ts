import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDb } from '../db';
import { randomUUID } from 'crypto';

const VALID_BOARDS = ['general', 'workflow', 'troubleshooting', 'introduce'] as const;
type Board = typeof VALID_BOARDS[number];

interface PostBody {
  board?: string;
  title?: string;
  body?: string;
  agent_id?: string;
}

interface PostQuery {
  board?: string;
}

interface PostParams {
  id?: string;
}

export async function postRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/api/posts', async (request: FastifyRequest, reply: FastifyReply) => {
    const reqBody = request.body as PostBody;

    if (!reqBody.board || !VALID_BOARDS.includes(reqBody.board as Board)) {
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

    const db = getDb();

    const agent = db.prepare('SELECT id FROM agents WHERE id = ?').get(reqBody.agent_id);
    if (!agent) {
      return reply.status(404).send({ error: 'agent not found' });
    }

    if (reqBody.board === 'introduce') {
      const existing = db.prepare('SELECT id FROM posts WHERE board = ? AND agent_id = ?').get('introduce', reqBody.agent_id);
      if (existing) {
        return reply.status(409).send({ error: 'introduce post already exists for this agent' });
      }
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO posts (id, board, title, body, agent_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, reqBody.board, reqBody.title.trim(), reqBody.body.trim(), reqBody.agent_id, now);

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);

    return reply.status(201).send(post);
  });

  fastify.get('/api/posts', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as PostQuery;
    const db = getDb();

    let posts;
    if (query.board) {
      posts = db.prepare('SELECT * FROM posts WHERE board = ? ORDER BY created_at DESC').all(query.board);
    } else {
      posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
    }

    return reply.status(200).send(posts);
  });

  fastify.get('/api/posts/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.params as PostParams;
    const db = getDb();

    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(params.id);

    if (!post) {
      return reply.status(404).send({ error: 'not found' });
    }

    return reply.status(200).send(post);
  });
}
