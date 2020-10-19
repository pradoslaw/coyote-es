import * as express from "express";
import jwtHandler from "../jwt";
import asyncHandler from "express-async-handler";
import client from "../elasticsearch";
import { ElasticsearchResult } from "../types/elasticsearch";
import { ContextBuilder, PromptBuilder } from "../builders/prompt";
import { default as transform, pluckUsersIds } from '../transformers/prompt';

export default class PromptController {
  public router = express.Router();

  constructor() {
    this.router.get('/:context?', jwtHandler(false), this.getUsers);
  }

  getUsers = asyncHandler(async (req: express.Request, res: express.Response) => {
    const context = await this.getContext(parseInt(req.params['context']));
    const options = { prefix: req.query['q'], context }

    const params = new PromptBuilder(options).build();

    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    res.send(transform(body));
  });

  private async getContext(docId: number): Promise<number[] | undefined> {
    if (!docId) {
      return;
    }

    const params = new ContextBuilder(docId).build()
    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    return pluckUsersIds(body);
  }
}
