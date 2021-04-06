import esb from 'elastic-builder';
import { Builder } from './builder';

const SOURCE = ['model', 'url', 'forum', 'title', 'salary', 'user_id', 'last_post_created_at'];

export default class SimilarBuilder extends Builder {
  private readonly searchText: string;

  constructor(searchText: string) {
    super();

    this.searchText = searchText;
  }

  protected body() {
    return esb.requestBodySearch()
      .query(
        esb.moreLikeThisQuery()
          .like(this.searchText)
          .fields(['title'])
          .minTermFreq(1)
          .maxQueryTerms(12)
      )
      .query(
        new esb.BoolQuery().must(new esb.TermsQuery('forum.is_prohibited', false))
      )
      .source(SOURCE)
      .size(50);
  }
}
