import { Model } from "../types/model";

export interface InputOptions {
  query?: string;
  user?: string;
  model?: Model;
}

export default class InputAnalyzer {
  private input: string;

  constructor(input: string) {
    this.input = input;
  }

  analyze(): InputOptions {
    if (!this.input) {
      return {};
    }

    return {
      user: this.captureSegment('user:'),
      model: this.normalizeModel(this.captureSegment('is:', Object.values(Model).map(item => item.toLowerCase()))),
      query: this.input
    };
  }

  private captureSegment(segment: string, validate: string[] = []) {
    const indexOf = this.input.indexOf(segment);

    if (indexOf < 0) {
      return undefined;
    }

    let beginning = indexOf + segment.length;

    const nextChar = this.input.substr(beginning, 1);
    let ending: number | undefined = this.input.indexOf(nextChar === '"' ? nextChar : ' ', beginning + 1);

    if (nextChar === '"') {
      beginning += 1;
    }

    ending = ending > -1 ? ending : undefined;

    const name = this.input.substring(beginning, ending);

    if (validate.length && !validate.includes(name)) {
      return undefined;
    }

    this.input = (this.input.slice(0, indexOf) + (ending ? this.input.slice(ending + 1) : '')).trim();

    return this.upperCase(name.trim());
  }

  private normalizeModel(model: string | undefined) {
    return model === undefined ? undefined : <Model>model;
  }

  private upperCase(name: string) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
