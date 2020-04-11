import * as express from "express";
import asyncHandler from "express-async-handler";
import {validationResult} from "express-validator";
import HubBuilder from "../builders/hub";
import { ElasticsearchResult } from "../models/elasticsearch";
import jwt from "express-jwt";
import client from '../elasticsearch';
import transform from '../transformers/hits';

export default class HubController {
  public router = express.Router();

  constructor() {
    this.router.get('/', this.getHandlers(), this.getSuggestions);
  }

  getSuggestions = asyncHandler(async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // @ts-ignore
    const params = new HubBuilder(req.user.iss).build();
    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    res.send(transform(body));
  });

  private getHandlers() {
    return [
      jwt({secret: process.env.APP_KEY!, credentialsRequired: true})
    ];
  }
}
