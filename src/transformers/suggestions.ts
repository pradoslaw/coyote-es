import * as elasticsearch from "../models/elasticsearch";
import Hit from '../models/hit';
import ContextFactory from "./context";
import {ElasticsearchResult} from "../models/elasticsearch";

const getOptions = (suggestions: elasticsearch.Suggestion[]): Hit[] => {
  let result: Hit[] = [];

  for (const suggestion of suggestions) {
    for (const option of suggestion.options) {
      result.push(<Hit> Object.assign(option._source, {_score: option._score}));
    }
  }

  return result;
};

export default (result: ElasticsearchResult, userId: number | null): Hit[] => {
  const context = ContextFactory.make(userId);

  return [...getOptions(result.suggest.user_suggestions), ...getOptions(result.suggest.all_suggestions)]
    .reduce((filtered: Hit[], current) => {
      if (!filtered.some(x => x.id == current.id)) {
        filtered.push(current);
      }

      return filtered;
    }, [])
    .map(hit => {
      context.setContext(hit);

      // remove large amount of data to minimize JSON
      delete hit.participants;
      delete hit.subscribers;

      return hit;
    });
};
