import { FastifyPluginAsync } from 'fastify';
import transform from '../transformers/hits.js';
import SimilarQuery from '../queries/similiar.js';

const preSerialization = (req, response, payload, done) => {
  done(null, transform(payload.body));
};

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{ Querystring: { q: string } }>(
    '/similar',
    { preSerialization },
    async function (request, reply) {
      return await this.elastic.search(
        new SimilarQuery(request.query['q']).build()
      );
    }
  );
};

export default root;
