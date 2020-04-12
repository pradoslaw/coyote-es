import * as elasticsearch from "../models/elasticsearch";
import ContextFactory from "./context";
import Hit from '../models/hit';


export default (result: elasticsearch.ElasticsearchResult, userId: number) => {
  const context = ContextFactory.make(userId);

  return result.hits.hits.map(hit => {
    let resultHit:Hit = hit._source;

    return context.setContext(resultHit);
  });
}
;
