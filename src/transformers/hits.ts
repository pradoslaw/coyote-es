import * as elasticsearch from "../models/elasticsearch";

export default (result: elasticsearch.ElasticsearchResult) => {
  return result.hits.hits.map(hit => hit._source);
}
