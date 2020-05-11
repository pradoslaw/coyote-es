import * as elasticsearch from "../types/elasticsearch";
import Hit from '../types/hit';

export default (result: elasticsearch.ElasticsearchResult) => {


  return result.hits.hits
    .map(hit => {
      let resultHit:Hit = hit._source;


      return resultHit;
    });
}
