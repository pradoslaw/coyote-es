import prohibited from "../src/transformers/prohibited";
import Hit from "../src/types/hit";

const h = (): Hit => {
  return {
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
  };
};

test('remove denied', () => {
  const hit = h();
  const jwt: Jwt = {iss: 1, prohibited: [1]};

  expect(prohibited(hit, jwt)).toBeTruthy();
});
