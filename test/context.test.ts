import ContextFactory from "../src/transformers/context";
import Hit from '../src/types/hit';
import { Context } from '../src/types/context';

const h = (): Hit => {
  return {
    forum: null,
    id: 0,
    last_post_created_at: null,
    model: "",
    participants: [1],
    replies: 0,
    subject: 'test',
    subscribers: [1],
    suggest: null,
    title: null,
    url: "",
    user_id: 1,
    score: null,
    salary: null
  };
};

test('set user context', () => {
  const factory = ContextFactory.make(1);
  const hit = h();

  factory.setContext(hit)

  expect(hit.context).toBe(Context.User);
});

test('set participant context', () => {
  const factory = ContextFactory.make(1);
  const hit = h();

  hit.user_id = null;
  factory.setContext(hit)

  expect(hit.context).toBe(Context.Participant);
});

test('set subscriber context', () => {
  const factory = ContextFactory.make(1);
  const hit = h();

  hit.participants = [];
  hit.user_id = null;
  factory.setContext(hit)

  expect(hit.context).toBe(Context.Subscriber);
});

test('set no context', () => {
  const factory = ContextFactory.make(1);
  const hit = h();

  hit.subscribers = [];
  hit.participants = [];
  hit.user_id = null;
  factory.setContext(hit)

  expect(hit.context).toBe(undefined);
});
