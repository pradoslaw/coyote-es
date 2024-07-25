import * as express from 'express';
import asyncHandler from 'express-async-handler';
import jwtHandler from '../jwt';
import client from '../elasticsearch';
import { query, validationResult } from 'express-validator';
import { SuggestionsBuilder } from '../builders/suggestions';
import { ElasticsearchResult } from '../types/elasticsearch';
import transform from "../transformers/suggestions";
import { Model } from"../types/model";
import { Request as JWTRequest } from "express-jwt";

export default class SuggestionController {
  public router = express.Router();

  constructor() {
    this.router.get('/', jwtHandler(false), this.validationRules, this.getSuggestions);
  }

  getSuggestions = asyncHandler(async (req: JWTRequest, res: express.Response) => {
    validationResult(req).throw();

    const params = new SuggestionsBuilder({prefix: req.query.q, userId: req.auth?.iss as unknown as number, models: req.query?.model}).build();
    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    console.log(`Response time for "${req.query.q}": ${body.took} ms`);

    res.send(transform(body, req.auth));
  });

  get validationRules() {
    return [
      query('q').not().isEmpty().escape(),
      query('model').optional().isIn([Model.Topic, Model.Job, Model.Wiki, Model.User])
    ];
  }
};
