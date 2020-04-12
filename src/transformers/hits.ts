import * as elasticsearch from "../models/elasticsearch";
import ContextFactory from "./context";
import Hit from '../models/hit';


export default (result: elasticsearch.ElasticsearchResult, userId: number) => {
  const context = ContextFactory.make(userId);

  return result.hits.hits.map(hit => {
    let resultHit:Hit = hit._source;

    context.setContext(resultHit);

    // remove large amount of data to minimize JSON
    delete resultHit.participants;
    delete resultHit.subscribers;

    return resultHit;
  });
}
