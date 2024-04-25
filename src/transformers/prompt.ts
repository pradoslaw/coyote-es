import type { ElasticsearchResult } from '../types/elasticsearch.js';
import type Hit from '../types/hit.js';

export default function source(result: ElasticsearchResult) {
  return result.hits.hits.map((hit) => hit._source);
}

export function getUsersIds(result: ElasticsearchResult): (number | null)[] {
  const hit: Hit = result.hits.hits[0]?._source;

  if (!hit.children) {
    return [];
  }

  return hit.children
    .filter((child) => child.user_id !== null)
    .map((child) => child.user_id)
    .concat([hit.user_id]);
}
