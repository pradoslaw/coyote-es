"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = __importDefault(require("./context"));
const getOptions = (suggestions) => {
    let result = [];
    for (const suggestion of suggestions) {
        for (const option of suggestion.options) {
            result.push(Object.assign(option._source, { _score: option._score }));
        }
    }
    return result;
};
exports.default = (result, userId) => {
    const context = context_1.default.make(userId);
    return [...getOptions(result.suggest.user_suggestions), ...getOptions(result.suggest.all_suggestions)]
        .reduce((filtered, current) => {
        if (!filtered.some(x => x.id == current.id)) {
            filtered.push(current);
        }
        return filtered;
    }, [])
        .map(hit => {
        context.setContext(hit);
        // remove large amount of data to minimize JSON
        delete hit.participants;
        delete hit.subscribers;
        return hit;
    });
};
