import esb from 'elastic-builder';
import { Model } from '../models/model';

interface SuggestionOptions {
  prefix: string;
  userId: number | null;
  models: Model[]
}

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
        _source: ['id', 'model', 'subject', 'url', 'forum', 'subscribers', 'participants', 'user_id'],
        suggest: suggest.toJSON()
      }
    }
  }

  private setDefaults() {
    this.options.models = this.options.models || [Model.Topic, Model.Job, Model.Microblog, Model.User];
  }

  private allSuggestions() {
    return new CompletionSuggester('all_suggestions', 'suggest')
      .prefix(this.options.prefix)
      .size(5)
      .contexts('model', this.options.models)
      .skipDuplicates();
  };

  private userSuggestions() {
    return new CompletionSuggester('user_suggestions', 'suggest')
      .prefix(this.options.prefix)
      .size(5)
      .contexts('category', [
        { context: `user:${this.options.userId}`, boost: 3 },
        { context: `participant:${this.options.userId}`, boost: 2 },
        { context: `subscriber:${this.options.userId}`}
      ])
      .skipDuplicates();
  };
}

