import * as elasticsearch from '../types/elasticsearch.js';
import type Hit from '../types/hit.js';
import type { Jwt } from '../types/jwt.js';
import ContextFactory from './context.js';
import { ElasticsearchResult } from '../types/elasticsearch.js';
import allowed from './allowed.js';

const getOptions = (suggestions: elasticsearch.Suggestion[] | null): Hit[] => {
  let result: Hit[] = [];

  if (!suggestions) {
    return result;
  }

  for (const suggestion of suggestions) {
    for (const option of suggestion.options) {
      result.push(
        <Hit>Object.assign(option._source, { _score: option._score })
      );
    }
  }

  return result;
};

export default (result: ElasticsearchResult, user?: Jwt): Hit[] => {
  const context = ContextFactory.make(user?.iss ?? null);

  return [
    ...getOptions(result.suggest?.user_suggestions),
    ...getOptions(result.suggest.all_suggestions),
  ]
    .reduce((filtered: Hit[], current) => {
      if (!filtered.some((x) => x.id == current.id)) {
        filtered.push(current);
      }

      return filtered;
    }, [])
    .map((hit) => {
      context.setContext(hit);

      // remove large amount of data to minimize JSON
      delete hit.participants;
      delete hit.subscribers;

      return hit;
    })
    .filter((hit) => allowed(hit, user));
};
