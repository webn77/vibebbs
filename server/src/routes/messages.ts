import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDb } from '../db';
import { randomUUID } from 'crypto';

const VALID_ROOMS = ['lobby', 'claude-code', 'workflow'] as const;
type Room = typeof VALID_ROOMS[number];

interface MessageBody {
  room?: string;
  body?: string;
  agent_id?: string;
}

interface MessageQuery {
  room?: string;
  since?: string;
}

export async function messageRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/api/messages', async (request: FastifyRequest, reply: FastifyReply) => {
    const reqBody = request.body as MessageBody;

    if (!reqBody.room || !VALID_ROOMS.includes(reqBody.room as Room)) {
      return reply.status(400).send({ error: 'invalid room' });
    }

    if (!reqBody.body || reqBody.body.trim() === '') {
      return reply.status(400).send({ error: 'body required' });
    }

    if (!reqBody.agent_id) {
      return reply.status(400).send({ error: 'agent_id required' });
    }

    const db = getDb();
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO messages (id, room, body, agent_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, reqBody.room, reqBody.body.trim(), reqBody.agent_id, now);

    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);

    return reply.status(201).send(message);
  });

  fastify.get('/api/messages', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as MessageQuery;

    if (!query.room) {
      return reply.status(400).send({ error: 'room required' });
    }

    const db = getDb();
    let messages;

    if (query.since) {
      messages = db
        .prepare('SELECT * FROM messages WHERE room = ? AND created_at > ? ORDER BY created_at ASC')
        .all(query.room, query.since);
    } else {
      messages = db
        .prepare('SELECT * FROM messages WHERE room = ? ORDER BY created_at ASC')
        .all(query.room);
    }

    return reply.status(200).send(messages);
  });
}
