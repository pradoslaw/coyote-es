import ContextFactory from './context.js';
import Hit from '../types/hit.js';
import { Context } from '../types/context.js';
import { Model } from '../types/model.js';

const h = (): Hit => ({
  forum: null,
  id: 0,
  last_post_created_at: null,
  model: '',
  participants: [1],
  replies: 0,
  title: 'test',
  subscribers: [1],
  suggest: null,
  url: '',
  user_id: 1,
  score: null,
  salary: null,
});

test('set user topic context', () => {
  const factory = ContextFactory.make(1);
  const hit = h();

  factory.setContext(hit);

  expect(hit.context).toBe(Context.User);
});

test('set participant topic context', () => {
  const factory = ContextFactory.make(1);
  const hit = h();

  hit.user_id = null;
  factory.setContext(hit);

  expect(hit.context).toBe(Context.Participant);
});

test('set subscriber topic context', () => {
  const factory = ContextFactory.make(1);
  const hit = h();

  hit.participants = [];
  hit.user_id = null;
  factory.setContext(hit);

  expect(hit.context).toBe(Context.Subscriber);
});

test('set no context', () => {
  const factory = ContextFactory.make(1);
  const hit = h();

  hit.subscribers = [];
  hit.participants = [];
  hit.user_id = null;
  factory.setContext(hit);

  expect(hit.context).toBe(undefined);
});

test('set user wiki context', () => {
  const factory = ContextFactory.make(1);
  let hit = h();

  hit.model = Model.Wiki;

  factory.setContext(hit);

  expect(hit.context).toBe(Context.User);
  expect(hit.model).toBe(Model.Wiki);
});
