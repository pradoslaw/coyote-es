import * as elasticsearch from "../models/elasticsearch";
import Hit from '../models/hit';

const getOptions = (suggestions: elasticsearch.Suggestion[]): Hit[] => {
  let result: Hit[] = [];

  const context = (contexts: elasticsearch.OptionContexts) => {
    return {context: contexts.category ? contexts.category[0] : contexts.model[0]};
  }

  for (const suggestion of suggestions) {
    for (const option of suggestion.options) {
      result.push(<Hit> Object.assign(option._source, context(option.contexts), {_score: option._score}));
    }
  }

  return result;
};

export default (result: elasticsearch.ElasticsearchResult): Hit[] => {
  return [...getOptions(result.suggest.user_suggestions), ...getOptions(result.suggest.all_suggestions)];
};
