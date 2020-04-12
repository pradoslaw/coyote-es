"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elastic_builder_1 = __importDefault(require("elastic-builder"));
const model_1 = require("../models/model");
class CompletionSuggester extends elastic_builder_1.default.CompletionSuggester {
    skipDuplicates() {
        this._body[this.name].completion['skip_duplicates'] = true;
        return this;
    }
    mergeInto(completion) {
        this._body = Object.assign(completion._body, this._body);
        return this;
    }
}
class SuggestionsBuilder {
    constructor(options) {
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
        };
    }
    setDefaults() {
        this.options.models = this.options.models || [model_1.Model.Topic, model_1.Model.Job, model_1.Model.Microblog, model_1.Model.User];
    }
    allSuggestions() {
        return new CompletionSuggester('all_suggestions', 'suggest')
            .prefix(this.options.prefix)
            .size(5)
            .contexts('model', this.options.models)
            .skipDuplicates();
    }
    ;
    userSuggestions() {
        return new CompletionSuggester('user_suggestions', 'suggest')
            .prefix(this.options.prefix)
            .size(5)
            .contexts('category', [
            { context: `user:${this.options.userId}`, boost: 3 },
            { context: `participant:${this.options.userId}`, boost: 2 },
            { context: `subscriber:${this.options.userId}` }
        ])
            .skipDuplicates();
    }
    ;
}
exports.SuggestionsBuilder = SuggestionsBuilder;
