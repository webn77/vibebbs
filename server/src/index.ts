import Fastify from 'fastify';
import cors from '@fastify/cors';
import { initDb } from './db';
import { agentRoutes } from './routes/agents';
import { postRoutes } from './routes/posts';
import { messageRoutes } from './routes/messages';
import { infoRoutes } from './routes/info';

const fastify = Fastify({ logger: false });

async function main(): Promise<void> {
  initDb();

  await fastify.register(cors);

  fastify.get('/health', async () => {
    return { status: 'ok' };
  });

  await fastify.register(infoRoutes);
  await fastify.register(agentRoutes);
  await fastify.register(postRoutes);
  await fastify.register(messageRoutes);

  await fastify.listen({ port: 3000, host: '0.0.0.0' });
  console.log('VibeBBS server running on port 3000');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
