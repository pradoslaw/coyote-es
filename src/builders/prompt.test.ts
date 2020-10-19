import { PromptBuilder } from './prompt';

test('build query without context id', () => {
  const builder = new PromptBuilder({prefix: 'a'});
  const json = builder.build().body;

  // @ts-ignore
  const must = json['query']['function_score']['query']['bool']['must'];

  expect(must[0]['terms']['model']).toEqual(['User']);
  expect(must[1]['prefix']['name.original']).toEqual('a');
});

test('build query with context id', () => {
  const builder = new PromptBuilder({prefix: 'a', context: [1, 1]});
  const json = builder.build().body;

  // @ts-ignore
  const functions = json['query']['function_score']['functions'];

  expect(functions[0]['filter']['ids']['values']).toEqual(['user_1']);
});
