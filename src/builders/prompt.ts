import esb from 'elastic-builder';
import { Model } from "../types/model";
import { Builder } from './builder';

const SCORE = '_score';
const TOPICS = 'topics';
const JOBS = 'jobs';

type Sort = typeof SCORE | typeof TOPICS | typeof JOBS;

export interface PromptOptions {
  prefix: string;
  context?: number[];
  model: Model;
  sort?: Sort;
  limit?: number;
}

const SOURCE = ['id', 'name', 'photo', 'group', 'real_name', 'topics', 'microblogs', 'jobs'];

export class ContextBuilder extends Builder {
  private docId: number;

  constructor(docId: number) {
    super();

    this.docId = docId;
  }

  protected body() {
    return esb.requestBodySearch()
      .query(
          new esb.BoolQuery()
            .must(new esb.IdsQuery('_doc', [`topic_${this.docId}`]))
      )
      .source(['user_id', 'children.user_id'])
  }
}

export class PromptBuilder extends Builder {
  private options: PromptOptions;

  constructor(options: PromptOptions) {
    super()

    // remove duplicates
    const context = [...new Set(options.context)];

    this.options = { ...options, context };
  }

  protected body() {
    this.options.sort = "topics";
    return esb.requestBodySearch()
      .query(
        new esb.FunctionScoreQuery()
          .query(
            new esb.BoolQuery()
              .must(new esb.TermsQuery('model', this.options.model))
              .must(new esb.PrefixQuery('name.original', this.options.prefix.toLocaleLowerCase()))
          )
          .scoreMode('sum')
          .function(esb.weightScoreFunction(20).filter(new esb.IdsQuery(undefined, this.options.context?.map(id => `user_${id}`))))
          .function(new esb.DecayScoreFunction('exp', 'decay_date').scale('10d').offset('1d').decay(0.01))
      )
      .size(this.options.limit || 25)
      .sort(new esb.Sort(this.options.sort || SCORE, 'desc'))
      .source(SOURCE)
  }
}
