import * as express from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'express-jwt';
import client from '../elasticsearch';
import { query, validationResult } from 'express-validator';
import { SuggestionsBuilder } from '../builders/suggestions';
import { ElasticsearchResult } from '../types/elasticsearch';
import transform from "../transformers/suggestions";
import { Model } from"../types/model";

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

    if (req.user) {
      // make sure user id is really int
      // @todo code duplicated along routes
      req.user.iss = parseInt(String(req.user.iss));
    }

    const userId = req.user ? req.user.iss : null;

    const params = new SuggestionsBuilder({prefix: req.query.q, userId, models: req.query?.model}).build();
    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    console.log(`Response time for "${req.query.q}": ${body.took} ms`);

    res.send(transform(body, req.user));
  });

  private getHandlers() {
    return [
      query('q').not().isEmpty().escape(),
      query('model').optional().isIn([Model.Topic, Model.Job, Model.Wiki, Model.User]),
      jwt({secret: process.env.APP_KEY!, credentialsRequired: false})
    ];
  }
};
