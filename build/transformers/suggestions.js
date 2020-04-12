"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getOptions = (suggestions) => {
    let result = [];
    const context = (contexts) => {
        return { context: contexts.category ? contexts.category[0] : contexts.model[0] };
    };
    for (const suggestion of suggestions) {
        for (const option of suggestion.options) {
            result.push(Object.assign(option._source, context(option.contexts), { _score: option._score }));
        }
    }
    return result;
};
exports.default = (result) => {
    return [...getOptions(result.suggest.user_suggestions), ...getOptions(result.suggest.all_suggestions)];
};
