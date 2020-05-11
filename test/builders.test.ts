import SearchBuilder from '../src/builders/search';
import {Model} from "../src/types/model";
import esb from 'elastic-builder';

test('build simple query with one model', () => {
  const builder = new SearchBuilder({models: [Model.Topic]}, {iss: 0, allowed: [1]});
  const result = builder.build();

  expect(result).toBeInstanceOf(esb.RequestBodySearch);

  const json = result.toJSON();

  // @ts-ignore
  expect(json['query']['function_score']['query']['bool']['must'][1]['terms']['model']).toEqual(['Topic']);
  // @ts-ignore
  expect(json['query']['function_score']['query']['bool']['must'][0]['bool']['should'][0]['terms']['forums.id']).toEqual([1]);
  // @ts-ignore
  expect(json['query']['function_score']['query']['bool']['must'][0]['bool']['should'][1]['bool']['must_not']['exists']['field']).toEqual('forum.id');
});
