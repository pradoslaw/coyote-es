import esb from 'elastic-builder';
import { BuilderInterface } from './builder';

const SOURCE = ['subject', 'model', 'subject', 'url', 'forum', 'title', 'salary', 'user_id'];

export default class SimilarBuilder implements BuilderInterface {
  private readonly searchText: string;

  constructor(searchText: string) {
    this.searchText = searchText;
  }

  build() {
    return {
      index: process.env.INDEX,
      body: this.body().toJSON()
    }
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
