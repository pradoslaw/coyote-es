import esb from "elastic-builder";
import {Model} from "../types/model";

const MODEL = 'User';

export default class UsersBuilder {
  private readonly prefix: string;

  constructor(prefix: string, limit: number = 1) {
    this.prefix = prefix;
  }

  // build() {
  //   return {
  //     index: process.env.INDEX,
  //     body: this.body().toJSON()
  //   }
  // }
  //
  // private body() {
  //
  // }
}
