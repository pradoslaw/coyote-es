import * as express from "express";
import asyncHandler from "express-async-handler";
import {query, validationResult} from "express-validator";
import HubBuilder from "../builders/hub";
import * as elasticsearch from "../models/elasticsearch";
import jwt from "express-jwt";
import {Client} from "@elastic/elasticsearch";

const client = new Client({node: `http://${process.env.ELASTICSEARCH_HOST}:9200`});

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

    const body: elasticsearch.ElasticsearchResult = result.body;

    // console.log(`Response time for "${req.query.q}": ${body.took} ms`);
    //
    // let output: any[] = [];
    //
    // for (const suggestions of Object.values(body.suggest)) {
    //   let options = suggestions[0].options;
    //
    //   for (const option of options) {
    //     output.push(Object.assign(option._source, this.context(option.contexts), {_score: option._score}));
    //   }
    // }

    res.send(body);
  });

  private context(contexts: any) {
    return {'context': 'category' in contexts ? contexts.category[0] : contexts.model[0]};
  }

  private getHandlers() {
    return [
      jwt({secret: process.env.APP_KEY!, credentialsRequired: true})
    ];
  }
}
