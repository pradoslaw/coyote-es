import type { ElasticsearchResult } from '../types/elasticsearch.js';
import type Hit from '../types/hit.js';
import type { Jwt } from '../types/jwt.js';
import ContextFactory from './context.js';
import allowed from './allowed.js';

export default (result: ElasticsearchResult, user: Jwt) => {
  const context = ContextFactory.make(user.iss!);

  return result.hits.hits
    .map((hit) => {
      let resultHit: Hit = hit._source;

      context.setContext(resultHit);

      // remove large amount of data to minimize JSON
      delete resultHit.participants;
      delete resultHit.subscribers;

      if (resultHit.text) {
        resultHit.text = resultHit.text.substring(0, 200);
      }

      return resultHit;
    })
    .filter((hit) => {
      return allowed(hit, user);
    });
};
