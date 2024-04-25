import { Source } from './elasticsearch.js';
import { Context } from './context.js';

export interface Child {
  id: number;
  user_id: number | null;
  text: string;
}

export default interface Hit extends Source {
  _score?: number;
  context?: Context;
  children?: Child[];
}
