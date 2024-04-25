import allowed from './allowed.js';
import Hit from '../types/hit.js';
import { Model } from '../types/model.js';
import { Jwt } from '../types/jwt.js';

const h = (): Hit => ({
  forum: {
    id: 1,
    is_prohibited: true,
    name: '',
    slug: '',
    url: '',
  },
  id: 1,
  last_post_created_at: null,
  model: Model.Topic,
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

test('keep allowed result', () => {
  const hit = h();
  const jwt: Jwt = { iss: 1, allowed: [1] };

  expect(allowed(hit, jwt)).toBeTruthy();
});

test('remove result if user is not authorized', () => {
  const hit = h();
  const jwt: Jwt = { iss: 1, allowed: [] };

  expect(allowed(hit, jwt)).toBeFalsy();
});

test('remove guarded result if user is authorized to different forum', () => {
  const hit = h();
  const jwt: Jwt = { iss: 1, allowed: [2] };

  expect(allowed(hit, jwt)).toBeFalsy();
});

test('remove guarded result when user is undefined', () => {
  const hit = h();

  expect(allowed(hit)).toBeFalsy();
});

test('remove hidden category', () => {
  const hit = h();

  hit.forum = { id: 1, name: '', slug: '', url: '', is_prohibited: false };
  const jwt: Jwt = { iss: 1, allowed: [2, 3, 4] };

  expect(allowed(hit, jwt)).toBeFalsy();
});
