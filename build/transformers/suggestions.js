"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = __importDefault(require("./context"));
const getOptions = (suggestions) => {
    let result = [];
    // const context = (contexts: elasticsearch.OptionContexts) => {
    //   return {context: contexts.category ? contexts.category[0] : contexts.model[0]};
    // }
    for (const suggestion of suggestions) {
        for (const option of suggestion.options) {
            result.push(Object.assign(option._source, { _score: option._score }));
        }
    }
    return result;
};
exports.default = (result, userId) => {
    const context = context_1.default.make(userId);
    let hits = [...getOptions(result.suggest.user_suggestions), ...getOptions(result.suggest.all_suggestions)];
    return hits.map(hit => {
        // let resultHit:Hit = hit._source;
        return context.setContext(hit);
    });
};
