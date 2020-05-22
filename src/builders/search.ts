import esb from 'elastic-builder';
import { Model } from '../types/model';

const SCORE = 'score';
const DATE = 'date';

type Sort = typeof SCORE | typeof DATE;

export interface SearchOptions {
  query?: string;
  userId?: number | null;
  model?: Model | Model[];
  categories?: number[];
  sort?: Sort;
}

const PARENT_SOURCE = [
  "id",
  "slug",
  "replies",
  "subject",
  "title",
  "created_at",
  "last_post_created_at",
  "url",
  "user_id",
  "forum",
  "text",
  "user_id",
  "model"
];

const CHILDREN_SOURCE = ["children.id", "children.user_id", "children.url", "children.created_at"];

const FIELDS = [
  "subject^2",
  "title^2",
  "text",
  "firm.name^2"
];

export default class SearchBuilder {
  private options: SearchOptions;
  private readonly jwt?: Jwt;

  constructor(options: SearchOptions, jwt?: Jwt) {
    this.options = options;
    this.jwt = jwt;

    this.setDefaults();
  }

  build() {
    return {
      index: process.env.INDEX,
      body: this.body().toJSON()
    }
  }

  private body() {
    const bool = new esb.BoolQuery().must(this.buildAllowedForums());

    if (this.options.model) {
      bool.must(this.buildModels());
    }

    if (this.options.query || this.options.userId) {
      bool.should(this.buildMatchQuery());
      bool.should(this.buildNestedQuery());
      bool.minimumShouldMatch('50%');
    }

    const request = esb.requestBodySearch()
      .highlight(new esb.Highlight(['title', 'subject', 'text']))
      .source(PARENT_SOURCE);

    if (this.options.sort === SCORE) {
      const fn = new esb.FunctionScoreQuery()
        .query(bool)
        .function(new esb.DecayScoreFunction('exp', 'decay_date').scale('180d').offset('1d').decay(0.1));

      request.query(fn);
    }
    else {
      request.query(bool)
        .sort(new esb.Sort('children.created_at', 'desc').nested({path: 'children', filter: new esb.ExistsQuery('children.created_at')}))
        .sort(new esb.Sort('created_at', 'desc'));
    }

    return request;
  }

  private buildModels() {
    return new esb.TermsQuery('model', this.options.model);
  }

  private buildAllowedForums() {
    const bool = new esb.BoolQuery().should(new esb.BoolQuery().mustNot(new esb.ExistsQuery('forum.id')));

    if (this.jwt) {
      bool.should(new esb.TermsQuery('forum.id', this.jwt.allowed as unknown as string[]))
    }
    else {
      bool.should(new esb.MatchQuery('forum.is_prohibited', 'false'));
    }

    return bool;
  }

  private buildMatchQuery() {
    const bool = new esb.BoolQuery();

    if (this.options.userId) {
      bool.must(new esb.MatchQuery('user_id', this.options.userId as unknown as string));
    }

    if (this.options.query) {
      bool.must(new esb.SimpleQueryStringQuery(this.options.query).fields(FIELDS))
    }

    return bool;
  }

  private buildNestedQuery() {
    const bool = new esb.BoolQuery();

    if (this.options.userId) {
      bool.must(new esb.MatchQuery('children.user_id', this.options.userId as unknown as string));
    }

    if (this.options.query) {
      bool.must(new esb.SimpleQueryStringQuery(this.options.query).fields(['children.text']))
    }

    return new esb.NestedQuery(bool, 'children').innerHits(
      new esb.InnerHits().size(1).highlight(new esb.Highlight('children.text')).source(CHILDREN_SOURCE)
    )
  }

  private setDefaults() {
    this.options.model = this.options.model || [Model.Topic, Model.Job, Model.Microblog, Model.Wiki];
    this.options.sort = this.options.sort || SCORE;
  }
}
