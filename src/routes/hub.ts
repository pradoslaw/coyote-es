import * as express from "express";
import asyncHandler from "express-async-handler";
import HubBuilder from "../builders/hub";
import { ElasticsearchResult } from "../types/elasticsearch";
import jwtHandler from '../jwt';
import client from '../elasticsearch';
import transform from '../transformers/hub';
import { Request as JWTRequest } from "express-jwt";

export default class HubController {
  public router = express.Router();

  constructor() {
    this.router.get('/', jwtHandler(true), this.getSuggestions);
  }

  getSuggestions = asyncHandler(async (req: JWTRequest, res: express.Response) => {
    const params = new HubBuilder(parseInt(req.auth!.iss!)).build();
    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    res.send(transform(body, req.auth!));
  });
}
