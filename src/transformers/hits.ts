import * as elasticsearch from "../types/elasticsearch";
import {default as Hit, Post, Comment} from '../types/hit';
import { InnerHits } from "../types/elasticsearch";

type HighlightType = 'subject' | 'title' | 'text';
type HighlightNestedType = 'posts.text' | 'comments.text';
type InnerHitsKeys = keyof InnerHits;

function map(hit: elasticsearch.Hit) {
  let result: Hit = hit._source;

  if (hit.inner_hits) {
    (Object.keys(hit.inner_hits) as InnerHitsKeys[]).forEach(key => {
      const innerHit = hit.inner_hits![key]!.hits.hits[0]; // only first hit

      if (innerHit) {
        const nested = <Post | Comment>innerHit?._source;
        const highlight: HighlightNestedType = `${key}.text` as HighlightNestedType;

        if ('highlight' in innerHit && highlight in innerHit.highlight!) {
          nested.text = innerHit.highlight![highlight]!.join(' ')
        }

        result[key] = [nested];
      }
    });
  }

  if (hit.highlight) {
    (Object.keys(hit.highlight) as HighlightType[]).forEach(key => {
      result[key] = hit.highlight![key]!.join(' ');
    })
  }

  return result;
}

export default (result: elasticsearch.ElasticsearchResult) => {
  return {
    'took': result.took,
    'total': result.hits.total,
    'hits': result.hits.hits.map(hit => map(hit))
  };
}
