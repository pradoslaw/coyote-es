import * as express from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'express-jwt';
import {Client} from '@elastic/elasticsearch';
import {query, validationResult} from 'express-validator';
import { SuggestionsBuilder } from '../builders/suggestions';
import * as elasticsearch from '../models/elasticsearch';
import { Model } from '../models/model';

const client = new Client({node: `http://${process.env.ELASTICSEARCH_HOST}:9200`});

class SuggestionController {
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
    const params = new SuggestionsBuilder({prefix: req.query.q, userId: req.user?.iss, models: req.query?.model}).build();
    const result = await client.search(params);

    const body: elasticsearch.ElasticsearchResult = result.body;

    console.log(`Response time for "${req.query.q}": ${body.took} ms`);

    let output: any[] = [];

    for (const suggestions of Object.values(body.suggest)) {
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
      query('model').optional().isIn([Model.Topic, Model.Microblog, Model.Job]),
      jwt({secret: process.env.APP_KEY!, credentialsRequired: false})
    ];
  }
}

export default SuggestionController;
