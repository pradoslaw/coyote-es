import * as express from "express";
import jwtHandler from "../jwt";
import asyncHandler from "express-async-handler";
import { query, validationResult } from "express-validator";
import client from "../elasticsearch";
import { ElasticsearchResult } from "../types/elasticsearch";
import transform from "../transformers/hits";
import SimilarBuilder from "../builders/similiar";

export default class SimilarController {
  public router = express.Router();

  constructor() {
    this.router.get('/', jwtHandler(false), this.validationRules, this.getSimilar);
  }

  getSimilar = asyncHandler(async (req: express.Request, res: express.Response) => {
    validationResult(req).throw();

    const params = new SimilarBuilder(req.query.q).build();
    const result = await client.search(params);

    const body: ElasticsearchResult = result.body;

    console.log(`Response time for "${req.query.q}": ${body.took} ms`);

    res.send(transform(body));
  });

  get validationRules() {
    return [
      query('q').not().isEmpty().escape()
    ];
  }
}
