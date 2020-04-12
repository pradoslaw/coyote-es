import { Source } from './elasticsearch';
import { Context } from "./context";

export default interface Hit extends Source {
  _score?:           number;
  context?:          Context;
}
