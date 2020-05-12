import esb from 'elastic-builder';
import { Model } from '../types/model';

interface SearchOptions {
  query?: string;
  userId?: number | null;
  models?: Model[];
}

const SOURCE = [
  "id",
  "slug",
  "replies",
  "subject",
  "title",
  "last_post_created_at",
  "url",
  "user_id",
  "forum",
  "text",
  "user_id",
  "model"
];

const FIELDS = [
  "subject^2",
  "title^2",
  "text",
  "firm.name^2"
];

export default class SearchBuilder {
  private options: SearchOptions;
  private jwt: Jwt;

  constructor(options: SearchOptions, jwt: Jwt) {
    this.options = options;
    this.jwt = jwt;

    this.setDefaults();
  }

  build() {
    const bool = new esb.BoolQuery().must(this.buildAllowedForums());

    if (this.options.models) {
      bool.must(this.buildModels());
    }

    if (this.options.query || this.options.userId) {
      bool.should(this.buildMatchQuery());
      bool.should(this.buildNestedQuery());
    }

    const request = esb.requestBodySearch()
      .query(
        new esb.FunctionScoreQuery()
          .query(bool)
          .function(new esb.DecayScoreFunction('exp', 'decay_date').scale('180d').offset('1d').decay(0.1))
      )
      .highlight(new esb.Highlight(['title', 'subject']))
      .source(SOURCE)

    return {
      index: process.env.INDEX,
      body: request.toJSON()
    }
  }

  private buildModels() {
    return new esb.TermsQuery('model', this.options.models);
  }

  private buildAllowedForums() {
    return new esb.BoolQuery()
      .should([
        new esb.TermsQuery('forum.id', this.jwt.allowed as unknown as string[]),
        new esb.BoolQuery().mustNot(new esb.ExistsQuery('forum.id'))
      ])
  }

  private buildMatchQuery() {
    let bool = [];

    if (this.options.userId) {
      bool.push(new esb.MatchQuery('user_id', this.options.userId as unknown as string));
    }

    if (this.options.query) {
      bool.push(new esb.SimpleQueryStringQuery(this.options.query).fields(FIELDS))
    }

    return new esb.BoolQuery().must(bool);
  }

  private buildNestedQuery() {
    let bool = [];

    if (this.options.userId) {
      bool.push(new esb.MatchQuery('user_id', this.options.userId as unknown as string));
    }

    if (this.options.query) {
      bool.push(new esb.SimpleQueryStringQuery(this.options.query).fields(['posts.text']))
    }

    return new esb.NestedQuery(new esb.BoolQuery().must(bool), 'posts').innerHits(new esb.InnerHits().size(1))
  }

  private setDefaults() {
    this.options.models = this.options.models || [Model.Topic, Model.Job, Model.Wiki, Model.User];
  }
}
