import SearchBuilder from '../src/builders/search';
import {Model} from "../src/types/model";
import esb from 'elastic-builder';

test('build simple query with one model', () => {
  const builder = new SearchBuilder({models: [Model.Topic]}, {allowed: [1]});
  const result = builder.build();

  expect(result).toBeInstanceOf(esb.RequestBodySearch);

  const json = result.toJSON();
  // @ts-ignore
  const must = json['query']['function_score']['query']['bool']['must'];

  expect(must[1]['terms']['model']).toEqual(['Topic']);
  expect(must[0]['bool']['should'][0]['terms']['forums.id']).toEqual([1]);
  expect(must[0]['bool']['should'][1]['bool']['must_not']['exists']['field']).toEqual('forum.id');
});

test('build with query', () => {
  const builder = new SearchBuilder({query: 'test'}, {allowed: [1]});
  const result = builder.build();

  const json = result.toJSON();

  // @ts-ignore
  const should = json['query']['function_score']['query']['bool']['should'];

  expect(should[0]['bool']['must']['simple_query_string']['query']).toEqual('test');
  expect(should[1]['nested']['query']['bool']['must']['simple_query_string']['query']).toEqual('test');
});

test('build with query and user', () => {
  const builder = new SearchBuilder({query: 'test', userId: 1}, {iss: 1, allowed: [1]});
  const result = builder.build();

  const json = result.toJSON();

  // @ts-ignore
  const should = json['query']['function_score']['query']['bool']['should'];

  expect(should[0]['bool']['must'][1]['simple_query_string']['query']).toMatch('test');
  expect(should[0]['bool']['must'][0]['match']['user_id']).toEqual(1);
  expect(should[1]['nested']['query']['bool']['must'][0]['match']['user_id']).toEqual(1);
  expect(should[1]['nested']['query']['bool']['must'][1]['simple_query_string']['query']).toMatch('test');
});
