import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { PromptQuery, ContextQuery, Sort } from '../queries/prompt.js';
import { ElasticsearchResult, Model } from '../types/index.js';
import { default as transform, getUsersIds } from '../transformers/prompt.js';
import { ApiResponse } from '@elastic/elasticsearch';

const preSerialization = (req, response, payload, done) => {
  done(null, transform(payload.body));
};

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get(
    '/prompt/users/:context?',
    { preSerialization },
    async function (
      request: FastifyRequest<{
        Querystring: { q: string };
        Params: { context: string };
      }>,
      reply
    ) {
      const getContext = async (docId: number): Promise<(number | null)[]> => {
        if (!docId) {
          return [];
        }

        const params = new ContextQuery(docId).build();
        const result: ApiResponse<ElasticsearchResult> =
          await this.elastic.search(params);

        return getUsersIds(result.body);
      };

      const context = await getContext(parseInt(request.params['context']));
      const options = {
        prefix: request.query['q'],
        context,
        model: Model.User,
      };

      return await this.elastic.search(new PromptQuery(options).build());
    }
  );

  fastify.get(
    '/prompt/tags',
    { preSerialization },
    async function (
      request: FastifyRequest<{ Querystring: { q: string } }>,
      reply
    ) {
      const options = {
        prefix: request.query['q'] ?? '',
        sort: 'topics' as Sort,
        model: Model.Tag,
        limit: 50,
      };

      return await this.elastic.search(new PromptQuery(options).build());
    }
  );
};

export default root;
