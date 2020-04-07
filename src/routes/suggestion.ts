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
    const params = new SuggestionsBuilder({prefix: req.query.q, userId: req.user?.iss}).build();
    const result = await client.search(params);

    console.log(`Response time for "${req.query.q}": ${result.body.took} ms`);

    let output: any[] = [];

    for (const suggestions of Object.values(result.body.suggest)) {
      // @ts-ignore
      let options = suggestions[0].options;

      for (const option of options) {
        output.push(Object.assign(option._source, this.context(option.contexts), {_score: option._score}));
      }
    }

    res.send(output);
  });

  private context(contexts: any) {
    return {'context': 'category' in contexts ? contexts.category[0] : contexts.model[0]};
  }

  private getHandlers() {
    return [
      query('q').not().isEmpty().escape(),
      jwt({secret: process.env.APP_KEY!, credentialsRequired: false})
    ];
  }
}

export default SuggestionController;
