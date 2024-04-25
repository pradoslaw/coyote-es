import { FastifyPluginAsync } from 'fastify';
import transform from '../transformers/hub.js';
import HubQuery from '../queries/hub.js';
import type { Jwt } from '../types/index.js';

const preSerialization = (req, response, payload, done) => {
  done(null, transform(payload.body, req.user));
};

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get(
    '/hub',
    { preSerialization, onRequest: [fastify.authenticate] },
    async function (request, reply) {
      return await this.elastic.search(
        new HubQuery((request.user as Jwt).iss!).build()
      );
    }
  );
};

export default root;
