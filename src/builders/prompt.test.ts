import { PromptBuilder } from './prompt';
import {Model} from "../types/model";

test('build query without context id', () => {
  const builder = new PromptBuilder({prefix: 'a'});
  const json = builder.build().body;

  // @ts-ignore
  const must = json['query']['function_score']['query']['bool']['must'];

  expect(must[0]['terms']['model']).toEqual(['User']);
  expect(must[1]['prefix']['name.original']).toEqual('a');
});

test('build query with context id', () => {
  const builder = new PromptBuilder({prefix: 'a', context: [1]});
  const json = builder.build().body;

  // @ts-ignore
  const must = json['query']['function_score']['functions'];

  expect(must[0]['filter']['ids']['values']).toEqual([1]);

});
