import esb from 'elastic-builder';
import { Model } from "../types/model";

interface PromptOptions {
  prefix: string;
  context?: number[];
}

const SOURCE = ['id', 'name', 'photo', 'group'];

export class PromptBuilder {
  private options: PromptOptions;

  constructor(options: PromptOptions) {
    this.options = options;
  }

  build() {
    return {
      index: process.env.INDEX,
      body: this.body().toJSON()
    }
  }

  private body() {
    return esb.requestBodySearch()
      .query(
        new esb.FunctionScoreQuery()
          .query(
            new esb.BoolQuery()
              .must(new esb.TermsQuery('model', Model.User))
              .must(new esb.PrefixQuery('name', this.options.prefix))

          )
          .function(esb.weightScoreFunction(2).filter(new esb.IdsQuery('id', this.options.context)))
          .function(new esb.DecayScoreFunction('exp', 'decay_date').scale('10d').offset('1d').decay(0.01))
      )
      .source(SOURCE)
  }
}
