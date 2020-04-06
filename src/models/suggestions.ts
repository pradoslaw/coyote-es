import esb from 'elastic-builder';

class SuggestionsBuilder {
  private prefix: string;
  private userId: number | null = null;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  setUserId(userId: number): this {
    this.userId = userId;

    return this;
  }

  build() {
    let suggest = this.allSuggestions().toJSON();

    if (this.userId) {
      suggest = Object.assign(suggest, this.userSuggestions().toJSON());
    }
    return {
      index: 'coyote',
      body: {
        _source: ['model', 'subject', 'url', 'forum'],
        suggest
      }
    }
  }

  private allSuggestions = () => {
    return new esb.CompletionSuggester('all_suggestions', 'suggest')
      .prefix(this.prefix)
      .size(5)
      .contexts('model', ['Topic']);
  };

  private userSuggestions = () => {
    return new esb.CompletionSuggester('user_suggestions', 'suggest')
      .prefix(this.prefix)
      .size(10)
      .contexts('category', [`user:${this.userId}`, `users:${this.userId}`, `subscribe:${this.userId}`]);
  };
}

export default SuggestionsBuilder;
