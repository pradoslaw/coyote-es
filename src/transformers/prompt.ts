import {ElasticsearchResult} from "../types/elasticsearch";

export default (result: ElasticsearchResult) => {
  return result.hits.hits.map(hit => hit._source);
}
