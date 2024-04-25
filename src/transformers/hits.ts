import * as elasticsearch from '../types/elasticsearch.js';
import { default as Hit, Child } from '../types/hit.js';

type HighlightType = 'title' | 'text';

function map(hit: elasticsearch.Hit) {
  let result: Hit = hit._source;

  result.children = [];

  if (hit.inner_hits?.children) {
    const innerHits = hit.inner_hits.children.hits.hits;

    if (innerHits) {
      for (const innerHit of innerHits) {
        const nested = <Child>innerHit?._source;

        if ('highlight' in innerHit && 'children.text' in innerHit.highlight!) {
          nested.text = innerHit.highlight!['children.text']!.join(' ');
        }

        result.children.push(nested);
      }
    }
  }

  if (hit.highlight) {
    (Object.keys(hit.highlight) as HighlightType[]).forEach((key) => {
      result[key] = hit.highlight![key]!.join(' ');
    });
  }

  return result;
}

export default (result: elasticsearch.ElasticsearchResult) => {
  return {
    took: result.took,
    total: result.hits.total,
    hits: result.hits.hits.map((hit) => map(hit)),
  };
};
