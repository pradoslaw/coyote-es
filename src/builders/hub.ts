import esb from 'elastic-builder';
import { Model } from '../types/model';
import { Builder } from './builder';

const SOURCE = ['id', 'model', 'subject', 'url', 'forum', 'title', 'salary', 'subscribers', 'participants', 'user_id', 'text'];

export default class HubBuilder extends Builder {
  private readonly userId: number;

  constructor(userId: number) {
    super();

    this.userId = userId;
  }

  protected body() {
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
      .source(SOURCE)
  }
}
