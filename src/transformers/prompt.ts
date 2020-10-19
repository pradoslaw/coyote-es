import {ElasticsearchResult} from "../types/elasticsearch";

export default function source(result: ElasticsearchResult) {
  return result.hits.hits.map(hit => hit._source);
}

export function pluckUsersIds(result: ElasticsearchResult) {
  const hit = result.hits.hits[0];

  let userIds: number[] = [];

  if (!hit) {
    return userIds;
  }

  userIds = [ hit._source.user_id! ];

  for (let child of hit._source.children!) {
    if (child.user_id != null) {
      userIds.push(child.user_id);
    }
  }

  return userIds;
}
