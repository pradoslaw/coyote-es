import esb from 'elastic-builder';
import { Model } from '../types/model';
import { Builder } from './builder';
import {JwtPayload} from "jsonwebtoken";

export const SCORE = 'score';
export const DATE = 'date';

type Sort = typeof SCORE | typeof DATE;

export interface SearchOptions {
  query?: string;
  userId?: number | null;
  model?: Model | Model[];
  categories?: number[];
  sort?: Sort;
  from?: number
}

const PARENT_SOURCE = [
  "id",
  "slug",
  "replies",
  "name",
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
  "title^10",
  "text",
  "firm.name^10",
  "name"
];

const FRAGMENT_SIZE = 255;

export default class SearchBuilder extends Builder {
  private options: SearchOptions;
  private readonly jwt?: JwtPayload;

  constructor(options: SearchOptions, jwt?: JwtPayload) {
    super()

    this.options = options;
    this.jwt = jwt;

    this.setDefaults();
  }

  protected body() {
    const bool = new esb.BoolQuery().must(this.buildAllowedForums());

    if (this.options.model) {
      bool.must(this.buildModels());
    }

    if (this.options.categories) {
      bool.must(this.buildCategories());
    }

    if (this.options.query || this.options.userId) {
      bool.should(this.buildMatchQuery());
      bool.should(this.buildNestedQuery());
      bool.minimumShouldMatch('50%');
    }

    const request = esb.requestBodySearch()
      .highlight(new esb.Highlight(['title', 'text', 'name']).fragmentSize(FRAGMENT_SIZE).numberOfFragments(3))
      .source(PARENT_SOURCE)
      .from(this.options.from!);

    if (this.options.sort === SCORE) {
      request.query(new esb.FunctionScoreQuery()
        .query(bool)
        .function(new esb.DecayScoreFunction('exp', 'decay_date').scale('1000d').offset('30d').decay(0.5))
      );
    }
    else {
      request.query(bool)
        .sort(new esb.Sort('decay_date', 'desc'))
        .sort(new esb.Sort('children.created_at', 'desc').nested({path: 'children', filter: new esb.ExistsQuery('children.created_at')}));
    }

    return request;
  }

  private buildModels() {
    return new esb.TermsQuery('model', this.options.model);
  }

  private buildCategories() {
    return new esb.TermsQuery('forum.id', this.options.categories as unknown as string[]);
  }

  private buildAllowedForums() {
    return new esb.BoolQuery()
      .should(new esb.BoolQuery().mustNot(new esb.ExistsQuery('forum.id')))
      .should(this.jwt
        ? new esb.TermsQuery('forum.id', this.jwt.allowed as unknown as string[])
          : new esb.MatchQuery('forum.is_prohibited', 'false'))
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

    return new esb.NestedQuery(bool, 'children')
      .innerHits(
        new esb.InnerHits()
          .size(3)
          .highlight(new esb.Highlight('children.text')/*.fragmentSize(FRAGMENT_SIZE).numberOfFragments(3)*/)
          .source(CHILDREN_SOURCE)
      )
      // .scoreMode('sum')
  }

  private setDefaults() {
    this.options.model = this.options.model || [Model.Topic, Model.Job, Model.Microblog, Model.Wiki, Model.User];
    this.options.sort = this.options.sort || SCORE;
    this.options.from = this.options.from || 0;
  }
}
