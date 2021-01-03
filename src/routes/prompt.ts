import * as express from "express";
import jwtHandler from "../jwt";
import asyncHandler from "express-async-handler";
import client from "../elasticsearch";
import { ElasticsearchResult } from "../types/elasticsearch";
import { ContextBuilder, PromptBuilder, PromptOptions } from "../builders/prompt";
import { default as transform, getUsersIds } from '../transformers/prompt';
import { Model } from "../types/model";

export default class PromptController {
  public router = express.Router();

  constructor() {
    this.router.get('/users/:context?', jwtHandler(false), this.getUsers);
    this.router.get('/tags', jwtHandler(false), this.getTags);
  }

  getUsers = asyncHandler(async (req: express.Request, res: express.Response) => {
    const context = await this.getContext(parseInt(req.params['context']));
    const options = { prefix: req.query['q'], context, model: Model.User }

    const params = new PromptBuilder(options).build();
    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    res.send(transform(body));
  });

  getTags = asyncHandler(async (req: express.Request, res: express.Response) => {
    const options: PromptOptions = { prefix: req.query['q'] ?? '', sort: "topics", model: Model.Tag, limit: 50 }

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

    return getUsersIds(body);
  }
}
