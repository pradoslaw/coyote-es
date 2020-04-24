import * as elasticsearch from "../types/elasticsearch";
import ContextFactory from "./context";
import Hit from '../types/hit';
import allowed from "./allowed";

export default (result: elasticsearch.ElasticsearchResult, user: Jwt) => {
  const context = ContextFactory.make(user.iss!);

  return result.hits.hits
    .map(hit => {
      let resultHit:Hit = hit._source;

      context.setContext(resultHit);

      // remove large amount of data to minimize JSON
      delete resultHit.participants;
      delete resultHit.subscribers;

      return resultHit;
    })
    .filter(hit => allowed(hit, user));
}
