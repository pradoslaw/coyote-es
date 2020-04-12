import esb from 'elastic-builder';
import { Model } from '../models/model';

export default class HubBuilder {
  private readonly userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  build() {
    return {
      index: process.env.INDEX,
      body: Object.assign(
        {_source: ['id', 'model', 'subject', 'url', 'forum', 'title', 'salary', 'subscribers', 'participants', 'user_id']},
        this.body().toJSON()
      )
    }
  }

  private body() {
    return esb.requestBodySearch()
      .query(
        new esb.FunctionScoreQuery()
          .query(
            new esb.BoolQuery()
              .must(new esb.TermsQuery('model', Object.values(Model)))
              .should([
                new esb.TermQuery('user_id', this.userId),
                new esb.TermQuery('subscribers', this.userId),
                new esb.TermQuery('participants', this.userId)
              ])
              .minimumShouldMatch('50%')
          )
          .function(esb.weightScoreFunction(1.2).filter(new esb.TermQuery('user_id', this.userId)))
          .function(new esb.DecayScoreFunction('exp', 'decay_date').scale('10d').offset('1h').decay(0.01))
      )
  }
}
