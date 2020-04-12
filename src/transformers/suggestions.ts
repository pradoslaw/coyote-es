import * as elasticsearch from "../models/elasticsearch";
import Hit from '../models/hit';
import ContextFactory from "./context";
import {ElasticsearchResult} from "../models/elasticsearch";

const getOptions = (suggestions: elasticsearch.Suggestion[]): Hit[] => {
  let result: Hit[] = [];


  // const context = (contexts: elasticsearch.OptionContexts) => {
  //   return {context: contexts.category ? contexts.category[0] : contexts.model[0]};
  // }

  for (const suggestion of suggestions) {
    for (const option of suggestion.options) {
      result.push(<Hit> Object.assign(option._source, {_score: option._score}));
    }
  }

  return result;
};

export default (result: ElasticsearchResult, userId: number | null): Hit[] => {
  const context = ContextFactory.make(userId);
  let hits: Hit[] = [...getOptions(result.suggest.user_suggestions), ...getOptions(result.suggest.all_suggestions)];

  return hits.map(hit => {
    // let resultHit:Hit = hit._source;

    return context.setContext(hit);
  });
};
