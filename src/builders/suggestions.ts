import esb from 'elastic-builder';
import { Model } from '../types/model';

interface SuggestionOptions {
  prefix: string;
  userId: number | null;
  models: Model[],
  limit?: number;
}

const SOURCE = ['id', 'model', 'subject', 'title', 'name', 'url', 'forum', 'subscribers', 'participants', 'user_id', 'photo'];

class CompletionSuggester extends esb.CompletionSuggester {
  [_body: string]: any;

  skipDuplicates(): this {
    this._body[this.name].completion['skip_duplicates'] = true;

    return this;
  }

  mergeInto(completion: CompletionSuggester): this {
    this._body = Object.assign(completion._body, this._body);

    return this;
  }
}

export class SuggestionsBuilder {
  private options: SuggestionOptions;

  constructor(options: SuggestionOptions) {
    this.options = options;

    this.setDefaults();
  }

  build() {
    let suggest = this.allSuggestions();

    if (this.options.userId) {
      this.userSuggestions().mergeInto(suggest);
    }

    return {
      index: process.env.INDEX,
      body: {
        _source: SOURCE,
        suggest: suggest.toJSON()
      }
    }
  }

  private setDefaults() {
    this.options.models = this.options.models || [Model.Topic, Model.Job, Model.Wiki, Model.User];
    this.options.limit = this.options.limit || 5;
  }

  private allSuggestions() {
    return new CompletionSuggester('all_suggestions', 'suggest')
      .prefix(this.options.prefix)
      .size(this.options.limit!)
      .contexts('model', this.options.models)
      .skipDuplicates();
  };

  private userSuggestions() {
    return new CompletionSuggester('user_suggestions', 'suggest')
      .prefix(this.options.prefix)
      .size(this.options.limit!)
      .contexts('category', [
        { context: `user:${this.options.userId}`, boost: 3 },
        { context: `participant:${this.options.userId}`, boost: 2 },
        { context: `subscriber:${this.options.userId}`}
      ])
      .skipDuplicates();
  };
}

