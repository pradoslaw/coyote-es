import * as express from "express";
import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import HubBuilder from "../builders/hub";
import { ElasticsearchResult } from "../types/elasticsearch";
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

    // make sure user id is really int
    // @todo code duplicated along routes
    const userId = parseInt(String(req.user!.iss));

    const params = new HubBuilder(userId).build();
    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    res.send(transform(body, req.user!));
  });

  private getHandlers() {
    return [
      jwt({secret: process.env.APP_KEY!, credentialsRequired: true})
    ];
  }
}
