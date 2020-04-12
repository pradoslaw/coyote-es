"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elastic_builder_1 = __importDefault(require("elastic-builder"));
const model_1 = require("../models/model");
class HubBuilder {
    constructor(userId) {
        this.userId = userId;
    }
    build() {
        return {
            index: process.env.INDEX,
            body: Object.assign({ _source: ['id', 'model', 'subject', 'url', 'forum', 'title', 'salary', 'subscribers', 'participants', 'user_id'] }, this.body().toJSON())
        };
    }
    body() {
        return elastic_builder_1.default.requestBodySearch()
            .query(new elastic_builder_1.default.FunctionScoreQuery()
            .query(new elastic_builder_1.default.BoolQuery()
            .must(new elastic_builder_1.default.TermsQuery('model', Object.values(model_1.Model)))
            .should([
            new elastic_builder_1.default.TermQuery('user_id', this.userId),
            new elastic_builder_1.default.TermQuery('subscribers', this.userId),
            new elastic_builder_1.default.TermQuery('participants', this.userId)
        ])
            .minimumShouldMatch('50%'))
            .function(elastic_builder_1.default.weightScoreFunction(1.2).filter(new elastic_builder_1.default.TermQuery('user_id', this.userId)))
            .function(new elastic_builder_1.default.DecayScoreFunction('exp', 'decay_date').scale('10d').offset('1h').decay(0.01)));
    }
}
exports.default = HubBuilder;
