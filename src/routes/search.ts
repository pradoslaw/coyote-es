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
import {Request as JWTRequest} from "express-jwt";

export default class SearchController {
  public router = express.Router();

  constructor() {
    this.router.get('/', jwtHandler(false), this.validationRules, this.getResults);
  }

  getResults = asyncHandler(async (req: JWTRequest, res: express.Response) => {
    validationResult(req).throw();

    const params = new SearchBuilder(await this.getOptions(req.query), req.auth).build();
    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    console.log(`Response time for "${req.query.q}": ${body.took} ms`);

    res.send(transform(body));
  });

  private async getOptions(query: any): Promise<SearchOptions> {
    let defaults: SearchOptions = {query: query.q, model: query?.model, sort: query?.sort, from: query?.from, categories: query?.categories};

    if (query?.user) {
      defaults.userId = await this.findUserId(query.user);
    }

    if (!query.q) {
      return defaults;
    }

    const options = new InputAnalyzer(query.q).analyze();

    if (options.user) {
      defaults.userId = await this.findUserId(options.user);
    }

    defaults.query = options.query;
    defaults.model = options.model ? options.model : defaults.model;

    return defaults;
  }

  private async findUserId(name: string): Promise<number | undefined> {
    const params = new SuggestionsBuilder({prefix: name, models: [Model.User], limit: 1}).build()
    const result = await client.search(params);

    const suggestions = suggestionsTransformer(result.body);

    if (suggestions.length) {
      return suggestions[0].id;
    }
  }

  get validationRules() {
    return [
      query('q').optional(),
      query('from').optional().isInt(),
      query('user').optional().isString(),
      query('model').optional().isIn(Object.values(Model)),
      query('sort').optional().isIn([SCORE, DATE])
    ];
  }
};
