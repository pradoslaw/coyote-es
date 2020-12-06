import esb from 'elastic-builder';
import { Builder } from './builder';

const SOURCE = ['subject', 'model', 'subject', 'url', 'forum', 'title', 'salary', 'user_id'];

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
          .fields(['subject'])
          .minTermFreq(1)
          .maxQueryTerms(12)
      )
      .source(SOURCE)
      .size(50);
  }
}
