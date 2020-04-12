import * as express from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'express-jwt';
import client from '../elasticsearch';
import {query, validationResult} from 'express-validator';
import { SuggestionsBuilder } from '../builders/suggestions';
import { ElasticsearchResult } from '../models/elasticsearch';
import { Model } from '../models/model';
import transform from "../transformers/suggestions";

export default class SuggestionController {
  public router = express.Router();

  constructor() {
    this.router.get('/', this.getHandlers(), this.getSuggestions);
  }

  getSuggestions = asyncHandler(async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }

    // @ts-ignore
    const userId = req.user ? parseInt(req.user.iss) : null;

    const params = new SuggestionsBuilder({prefix: req.query.q, userId, models: req.query?.model}).build();
    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    console.log(`Response time for "${req.query.q}": ${body.took} ms`);

    res.send(transform(body, userId));
  });

  private getHandlers() {
    return [
      query('q').not().isEmpty().escape(),
      query('model').optional().isIn([Model.Topic, Model.Microblog, Model.Job]),
      jwt({secret: process.env.APP_KEY!, credentialsRequired: false})
    ];
  }
};
