import allowed from "../src/transformers/allowed";
import Hit from "../src/types/hit";
import { Model } from "../src/types/model";

const h = (): Hit => ({
  forum: {
    id: 1,
    is_prohibited: true,
    name: '',
    slug: '',
    url: ''
  },
  id: 1,
  last_post_created_at: null,
  model: Model.Topic,
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
});

test('keep allowed result', () => {
  const hit = h();
  const jwt: Jwt = {iss: 1, allowed: [1]};

  expect(allowed(hit, jwt)).toBeTruthy();
});

test('keep allowed result if user is authorized', () => {
  const hit = h();
  const jwt: Jwt = {iss: 1, allowed: []};

  expect(allowed(hit, jwt)).toBeTruthy();
});

test('remove guarded result if user is authorized to different forum', () => {
  const hit = h();
  const jwt: Jwt = {iss: 1, allowed: [2]};

  expect(allowed(hit, jwt)).toBeFalsy();
});

test('remove guarded result when user is undefined', () => {
  const hit = h();

  expect(allowed(hit)).toBeFalsy();
});
