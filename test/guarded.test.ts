import guarded from "../src/transformers/guarded";
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

test('remove guarded result', () => {
  const hit = h();
  const jwt: Jwt = {iss: 1, guarded: [1]};

  expect(guarded(hit, jwt)).toBeTruthy();
});

test('keep guarded result if user is authorized', () => {
  const hit = h();
  const jwt: Jwt = {iss: 1, guarded: []};

  expect(guarded(hit, jwt)).toBeFalsy();
});

test('remove guarded result when user is undefined', () => {
  const hit = h();

  expect(guarded(hit)).toBeTruthy();
});
