import * as express from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'express-jwt';
import { Client } from '@elastic/elasticsearch';
import { query } from 'express-validator';
import SuggestionsBuilder from '../models/suggestions';

const client = new Client({node: `http://${process.env.ELASTICSEARCH_HOST}:9200`});

class SuggestionController {
  public router = express.Router();

  constructor() {
    this.router.get('/', this.getHandlers(), this.getSuggestions);
  }

  getSuggestions = asyncHandler(async (req: express.Request, res: express.Response) => {
    // @ts-ignore
    const params = new SuggestionsBuilder(req.query.q).setUserId(req.user?.iss).build();
    const result = await client.search(params);

    console.log(`Response time for "${req.query.q}": ${result.body.took} ms`);

    res.send(result.body.suggest);
  });

  private getHandlers() {
    return [
      query('q').not().isEmpty().escape(),
      jwt({secret: process.env.APP_KEY!, credentialsRequired: false})
    ];
  }
}

export default SuggestionController;
