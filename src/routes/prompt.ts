import * as express from "express";
import jwtHandler from "../jwt";
import asyncHandler from "express-async-handler";
import client from "../elasticsearch";
import { ElasticsearchResult } from "../types/elasticsearch";
import { PromptBuilder } from "../builders/prompt";
import { default as transform } from '../transformers/prompt';

export default class PromptController {
  public router = express.Router();

  constructor() {
    this.router.get('/', jwtHandler(false), this.getUsers);
  }

  getUsers = asyncHandler(async (req: express.Request, res: express.Response) => {
    const params = new PromptBuilder({prefix: req.query['q']}).build()
    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    res.send(transform(body));
  });
}
