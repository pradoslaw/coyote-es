import esb from 'elastic-builder';
import { Model } from "../types/model";

interface PromptOptions {
  prefix: string;
  context?: number[];
}

const SOURCE = ['id', 'name', 'photo', 'group'];

export class ContextBuilder {
  private docId: number;

  constructor(docId: number) {
    this.docId = docId;
  }

  build() {
    return {
      index: process.env.INDEX,
      body: this.body().toJSON()
    }
  }

  body() {
    return esb.requestBodySearch()
      .query(
          new esb.BoolQuery()
            .must(new esb.IdsQuery('_doc', [`topic_${this.docId}`]))
      )
      .source(['user_id', 'children.user_id'])
  }
}

export class PromptBuilder {
  private options: PromptOptions;

  constructor(options: PromptOptions) {
    // remove duplicates
    const context = [...new Set(options.context)];

    this.options = {...options, context };
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
              .must(new esb.PrefixQuery('name.original', this.options.prefix))
          )
          .scoreMode('sum')
          .function(esb.weightScoreFunction(20).filter(new esb.IdsQuery(undefined, this.options.context?.map(id => `user_${id}`))))
          .function(new esb.DecayScoreFunction('exp', 'decay_date').scale('10d').offset('1d').decay(0.01))
      )
      .size(5)
      .source(SOURCE)
  }
}
