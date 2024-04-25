import dotenv from 'dotenv';
import fs from 'fs';
import Fastify from 'fastify';
import elasticsearchPlugin from './plugins/elasticsearch.js';
import jwtPlugin from './plugins/jwt.js';
import sensiblePlugin from './plugins/sensible.js';
import hubRoutes from './routes/hub.js';
import promptRoutes from './routes/prompt.js';
import rootRoutes from './routes/root.js';
import searchRoutes from './routes/search.js';
import similarRoutes from './routes/similar.js';
import suggestionsRoutes from './routes/suggestions.js';

dotenv.config({ path: '.env' });

if (process.env.APP_KEY_FILE) {
  const data = fs.readFileSync(process.env.APP_KEY_FILE);

  process.env['APP_KEY'] = data.toString().trim();
}

const fastify = Fastify({
  logger: true,
  ignoreTrailingSlash: true,
});

fastify.register(elasticsearchPlugin);
fastify.register(jwtPlugin);
fastify.register(sensiblePlugin);
fastify.register(hubRoutes);
fastify.register(rootRoutes);
fastify.register(suggestionsRoutes);
fastify.register(similarRoutes);
fastify.register(promptRoutes);
fastify.register(searchRoutes);

const start = async () => {
  try {
    await fastify.listen({ port: 3500 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

void start();
