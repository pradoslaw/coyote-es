import { ElasticsearchResult } from "../types/elasticsearch";
import Hit from "../types/hit";

export default function source(result: ElasticsearchResult) {
  return result.hits.hits.map(hit => hit._source);
}

export function getUsersIds(result: ElasticsearchResult) {
  const hit: Hit = result.hits.hits[0]?._source;

  let userIds: number[] = [];

  if (!hit) {
    return userIds;
  }

  userIds = [ hit.user_id! ];

  for (let child of hit.children!) {
    if (child.user_id != null) {
      userIds.push(child.user_id);
    }
  }

  return userIds;
}
