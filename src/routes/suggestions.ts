import { FastifyPluginAsync } from 'fastify';
import transform from '../transformers/suggestions.js';
import { Model } from '../types/model.js';
import { SuggestionsQuery } from '../queries/suggestions.js';

const preSerialization = (req, response, payload, done) => {
  done(null, transform(payload.body));
};

interface QueryString {
  q: string;
  model: Model[];
}

const root: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get<{ Querystring: QueryString }>(
    '/suggestions',
    { preSerialization },
    async function (request, reply) {
      return await this.elastic.search(
        new SuggestionsQuery({
          prefix: request.query['q'],
          models: request.query['model'],
        }).build()
      );
    }
  );
};

export default root;
