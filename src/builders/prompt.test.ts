import { PromptBuilder } from './prompt';
import { Model } from "../types/model";

test('build query without context id', () => {
  const builder = new PromptBuilder({prefix: 'a', model: Model.User});
  const json = builder.build().body;

  // @ts-ignore
  const must = json['query']['function_score']['query']['bool']['must'];

  expect(must[0]['terms']['model']).toEqual(['User']);
  expect(must[1]['prefix']['name.original']).toEqual('a');
});

test('build query with context id', () => {
  const builder = new PromptBuilder({prefix: 'a', context: [1, 1], model: Model.User});
  const json = builder.build().body;

  // @ts-ignore
  const functions = json['query']['function_score']['functions'];

  expect(functions[0]['filter']['ids']['values']).toEqual(['user_1']);
});

test('build tag query', () => {
  const builder = new PromptBuilder({prefix: 'a', sort: 'topics', model: Model.Tag});
  const json = builder.build().body;

  // @ts-ignore
  expect(json['sort'][0]['topics']).toEqual('desc');
});
