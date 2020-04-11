import { Source } from './elasticsearch';

export interface Suggestion extends Source {
  _score:           number;
  context:          string;
}
