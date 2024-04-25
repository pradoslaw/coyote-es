export interface ElasticsearchResult {
  took: number;
  timed_out: boolean;
  _shards: Shards;
  hits: Hits;
  suggest: Suggest;
}

export interface Shards {
  total: number;
  successful: number;
  skipped: number;
  failed: number;
}

export interface Hits {
  total: number;
  max_score: number;
  hits: Hit[];
}

export interface Suggest {
  all_suggestions: Suggestion[];
  user_suggestions: Suggestion[];
}

export interface Suggestion {
  text: string;
  offset: number;
  length: number;
  options: Option[];
}

export interface Hit {
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: Source;
  highlight?: Highlight;
  inner_hits?: InnerHits;
}

export interface Children {
  hits: Hits;
}

export interface InnerHits {
  children?: Children;
}

export interface Highlight {
  title?: string[];
  text?: string[];
  'children.text'?: string[];
}

export interface Option {
  text: string;
  _index: string;
  _type: string;
  _id: string;
  _score: number;
  _source: Source;
  contexts: OptionContexts;
}

export interface Source {
  model: string;
  id: number;
  score: number | null;
  replies: number | null;
  title: string | null;
  text?: string;
  salary: number | null;
  last_post_created_at: Date | null;
  url: string;
  user_id: number | null;
  forum: Forum | null;
  suggest: SuggestElement[] | null;
  participants?: number[];
  subscribers?: number[];
}

export interface Forum {
  id: number;
  name: string;
  slug: string;
  url: string;
  is_prohibited: boolean;
}

export interface SuggestElement {
  input: string;
  weight: number;
  contexts: SuggestContexts;
}

export interface SuggestContexts {
  category: string[];
}

export interface OptionContexts {
  model: string[];
  category: string[];
}
