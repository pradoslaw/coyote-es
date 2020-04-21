import guarded from "../src/transformers/guarded";
import Hit from "../src/types/hit";

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
});

test('remove guarded', () => {
  const hit = h();
  const jwt: Jwt = {iss: 1, guarded: [1]};

  expect(guarded(hit, jwt)).toBeTruthy();
});
