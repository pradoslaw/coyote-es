import * as express from "express";
import asyncHandler from "express-async-handler";
import HubBuilder from "../builders/hub";
import { ElasticsearchResult } from "../types/elasticsearch";
import jwtHandler from '../jwt';
import client from '../elasticsearch';
import transform from '../transformers/hub';

export default class HubController {
  public router = express.Router();

  constructor() {
    this.router.get('/', jwtHandler(true), this.getSuggestions);
  }

  getSuggestions = asyncHandler(async (req: express.Request, res: express.Response) => {
    const params = new HubBuilder(req.user!.iss!).build();
    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    res.send(transform(body, req.user!));
  });
}
