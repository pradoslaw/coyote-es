import { RequestBodySearch } from 'elastic-builder';

export interface BuilderInterface {
  build(): { index: string | undefined; body: object }
}

export abstract class Builder implements BuilderInterface {
  build() {
    return {
      index: process.env.INDEX,
      body: this.body().toJSON()
    }
  }

  protected abstract body(): RequestBodySearch;
}
