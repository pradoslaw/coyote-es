import * as express from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'express-jwt';
import client from '../elasticsearch';
import { query, validationResult } from 'express-validator';
import SearchBuilder from '../builders/search';
import { ElasticsearchResult } from '../types/elasticsearch';
import { Model } from"../types/model";
import transform from '../transformers/hits';

export default class SearchController {
  public router = express.Router();

  constructor() {
    this.router.get('/', this.handlers, this.getResults);
  }

  getResults = asyncHandler(async (req: express.Request, res: express.Response) => {
    validationResult(req).throw();

    const params = new SearchBuilder({query: req.query.q, userId: req.query.user_id, models: req.query?.models}, req.user).build();
    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    console.log(`Response time for "${req.query.q}": ${body.took} ms`);

    res.send(transform(body));
  });

  get handlers() {
    return [
      query('q').optional(),
      query('user_id').optional().isNumeric(),
      query('model').optional().isIn([Model.Topic, Model.Job, Model.Wiki, Model.User]),
      jwt({secret: process.env.APP_KEY!, credentialsRequired: false})
    ];
  }
};
