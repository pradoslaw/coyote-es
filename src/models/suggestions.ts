import esb from 'elastic-builder';

const INDEX_NAME = 'coyote';

interface SuggestionOptions {
  prefix: string;
  userId: number | null;
}

class SuggestionsBuilder {
  private options: SuggestionOptions;

  constructor(options: SuggestionOptions) {
    this.options = options;
  }

  build() {
    let suggest = this.allSuggestions().toJSON();

    if (this.options.userId) {
      suggest = Object.assign(suggest, this.userSuggestions().toJSON());
    }
    return {
      index: INDEX_NAME,
      body: {
        _source: ['id', 'model', 'subject', 'url', 'forum'],
        suggest
      }
    }


  }

  private allSuggestions = () => {
    return new esb.CompletionSuggester('all_suggestions', 'suggest')
      .prefix(this.options.prefix)
      .size(5)
      .contexts('model', ['Topic']);
  };

  private userSuggestions = () => {
    return new esb.CompletionSuggester('user_suggestions', 'suggest')
      .prefix(this.options.prefix)
      .size(10)
      .contexts('category', [`user:${this.options.userId}`, `users:${this.options.userId}`, `subscribe:${this.options.userId}`]);
  };
}

export default SuggestionsBuilder;
