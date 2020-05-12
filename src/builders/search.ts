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
  private readonly jwt?: Jwt;

  constructor(options: SearchOptions, jwt: Jwt | undefined) {
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

    if (this.options.models) {
      bool.must(this.buildModels());
    }

    if (this.options.query || this.options.userId) {
      bool.should(this.buildMatchQuery());
      bool.should(this.buildNestedQuery());
      bool.minimumShouldMatch('50%');
    }

    return esb.requestBodySearch()
      .query(
        new esb.FunctionScoreQuery()
          .query(bool)
          .function(new esb.DecayScoreFunction('exp', 'decay_date').scale('180d').offset('1d').decay(0.1))
      )
      .highlight(new esb.Highlight(['title', 'subject']))
      .source(SOURCE);
  }

  private buildModels() {
    return new esb.TermsQuery('model', this.options.models);
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
      bool.must(new esb.MatchQuery('posts.user_id', this.options.userId as unknown as string));
    }

    if (this.options.query) {
      bool.must(new esb.SimpleQueryStringQuery(this.options.query).fields(['posts.text']))
    }

    return new esb.NestedQuery(bool, 'posts').innerHits(
      new esb.InnerHits().size(1).highlight(new esb.Highlight('posts.text'))
    )
  }

  private setDefaults() {
    this.options.models = this.options.models || [Model.Topic, Model.Job, Model.Microblog, Model.Wiki];
  }
}
