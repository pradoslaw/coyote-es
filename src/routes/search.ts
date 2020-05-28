import * as express from 'express';
import asyncHandler from 'express-async-handler';
import jwtHandler from '../jwt';
import client from '../elasticsearch';
import { query, validationResult } from 'express-validator';
import { default as SearchBuilder, SearchOptions, SCORE, DATE } from '../builders/search';
import { SuggestionsBuilder } from '../builders/suggestions';
import { ElasticsearchResult } from '../types/elasticsearch';
import { Model } from"../types/model";
import InputAnalyzer from '../analyzers';
import transform from '../transformers/hits';
import suggestionsTransformer from '../transformers/suggestions';

export default class SearchController {
  public router = express.Router();

  constructor() {
    this.router.get('/', jwtHandler(false), this.validationRules, this.getResults);
  }

  getResults = asyncHandler(async (req: express.Request, res: express.Response) => {
    validationResult(req).throw();

    const params = new SearchBuilder(await this.getOptions(req.query), req.user).build();
    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    console.log(`Response time for "${req.query.q}": ${body.took} ms`);

    res.send(transform(body));
  });

  private async getOptions(query: any): Promise<SearchOptions> {
    let defaults: SearchOptions = {query: query.q, userId: query.user_id, model: query?.model, sort: query?.sort, categories: query?.categories};

    if (!query.q) {
      return defaults;
    }

    const options = new InputAnalyzer(query.q).analyze();

    if (options.user) {
      const params = new SuggestionsBuilder({prefix: options.user, models: [Model.User], limit: 1}).build()
      const result = await client.search(params);

      const suggestions = suggestionsTransformer(result.body, undefined);

      if (suggestions.length) {
        defaults.userId = suggestions[0].id;
      }
    }

    defaults.query = options.query;
    defaults.model = options.model ? options.model : defaults.model;

    return defaults;
  }

  get validationRules() {
    return [
      query('q').optional(),
      query('user_id').optional().isNumeric(),
      query('model').optional().isIn(Object.values(Model)),
      query('sort').optional().isIn([SCORE, DATE])
    ];
  }
};
