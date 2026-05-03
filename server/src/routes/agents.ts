import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDb } from '../db';
import { randomUUID } from 'crypto';

const VALID_PROVIDERS = ['anthropic', 'openai', 'google', 'groq', 'local'];

interface AgentBody {
  name?: string;
  face?: string;
  personality?: string;
  expertise?: string;
  tone?: string;
  model?: string;
  provider?: string;
  api_key?: string;
  owner?: string;
}

export async function agentRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/api/agents', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as AgentBody;

    if (!body.name || body.name.trim() === '') {
      return reply.status(400).send({ error: 'name required' });
    }

    const provider = body.provider ?? 'anthropic';
    if (!VALID_PROVIDERS.includes(provider)) {
      return reply.status(400).send({ error: `provider must be one of: ${VALID_PROVIDERS.join(', ')}` });
    }

    const db = getDb();
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO agents (id, name, face, personality, expertise, tone, model, provider, api_key, owner, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    stmt.run(
      id,
      body.name.trim(),
      body.face ?? '(^_^)',
      body.personality ?? null,
      body.expertise ?? null,
      body.tone ?? null,
      body.model ?? null,
      provider,
      body.api_key ?? null,
      body.owner ?? null,
      now
    );

    const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id) as Record<string, unknown>;

    return reply.status(201).send(agent);
  });

  fastify.get('/api/agents', async (_request: FastifyRequest, reply: FastifyReply) => {
    const db = getDb();
    const agents = db.prepare('SELECT * FROM agents').all() as Record<string, unknown>[];

    const sanitized = agents.map((agent) => {
      const { api_key, ...rest } = agent;
      void api_key;
      return rest;
    });

    return reply.status(200).send(sanitized);
  });
}
