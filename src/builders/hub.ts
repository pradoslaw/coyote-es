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
      body: {
        // _source: ['id', 'model', 'subject', 'url', 'forum'],
        suggest: this.body().toJSON()
      }
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
                new esb.TermQuery('subscriber', this.userId),
                new esb.TermQuery('participant', this.userId)
              ])
              .minimumShouldMatch('50%')
          )
          .function(esb.weightScoreFunction(1.2).filter(new esb.TermQuery('user_id', this.userId)))
          .function(new esb.DecayScoreFunction('exp', 'decay_date').scale('10d').offset('1h').decay(0.01))
      )
  }
}
