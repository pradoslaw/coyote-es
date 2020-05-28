import * as express from 'express';
import asyncHandler from 'express-async-handler';
import jwtHandler from '../jwt';
import client from '../elasticsearch';
import { query, validationResult } from 'express-validator';
import { SuggestionsBuilder } from '../builders/suggestions';
import { ElasticsearchResult } from '../types/elasticsearch';
import transform from "../transformers/suggestions";
import { Model } from"../types/model";

export default class SuggestionController {
  public router = express.Router();

  constructor() {
    this.router.get('/', jwtHandler(false), this.validationRules, this.getSuggestions);
  }

  getSuggestions = asyncHandler(async (req: express.Request, res: express.Response) => {
    validationResult(req).throw();

    let userId = null;

    const params = new SuggestionsBuilder({prefix: req.query.q, userId: req.user?.iss, models: req.query?.model}).build();
    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    console.log(`Response time for "${req.query.q}": ${body.took} ms`);

    res.send(transform(body, req.user));
  });

  get validationRules() {
    return [
      query('q').not().isEmpty().escape(),
      query('model').optional().isIn([Model.Topic, Model.Job, Model.Wiki, Model.User])
    ];
  }
};
