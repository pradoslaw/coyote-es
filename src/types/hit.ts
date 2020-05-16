import { Source } from './elasticsearch';
import { Context } from "./context";

export interface Comment {
  id:               number;
  user_id:          number | null;
  text:             string;
}

export interface Post {
  id:               number;
  user_id:          number | null;
  text:             string;
}

export default interface Hit extends Source {
  _score?:            number;
  context?:           Context;
  posts?:             Post[];
  comments?:          Comment[];
}
