import { FastifyPluginAsync } from 'fastify';
import { Jwt, Model } from '../types/index.js';
import SearchQuery, { SearchOptions, Sort } from '../queries/search.js';
import InputAnalyzer from '../analyzer/index.js';
import { SuggestionsQuery } from '../queries/suggestions.js';
import suggestionsTransformer from '../transformers/suggestions.js';
import transform from '../transformers/hits.js';

const preSerialization = (req, response, payload, done) => {
  done(null, transform(payload.body));
};

interface QueryString {
  q: string;
  model?: Model;
  sort?: Sort;
  from?: number;
  categories: number[];
  user: string;
}

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const findUserId = async (name: string): Promise<number | undefined> => {
    const params = new SuggestionsQuery({
      prefix: name,
      models: [Model.User],
      limit: 1,
    }).build();
    const result = await fastify.elastic.search(params);

    const suggestions = suggestionsTransformer(result.body);

    if (suggestions.length) {
      return suggestions[0].id;
    }
  };

  const getOptions = async (query: QueryString) => {
    let defaults: SearchOptions = {
      query: query.q,
      model: query.model,
      sort: query.sort,
      from: query?.from,
      categories: query.categories,
    };

    if (query?.user) {
      defaults.userId = await findUserId(query.user);
    }

    if (!query.q) {
      return defaults;
    }

    const options = new InputAnalyzer(query.q).analyze();

    if (options.user) {
      defaults.userId = await findUserId(options.user);
    }

    defaults.query = options.query;
    defaults.model = options.model ?? defaults.model;

    return defaults;
  };

  fastify.get<{ Querystring: QueryString }>(
    '/search',
    { preSerialization },
    async function (request, reply) {
      return await this.elastic.search(
        new SearchQuery(
          await getOptions(request.query),
          request.user as Jwt
        ).build()
      );
    }
  );
};

export default root;
