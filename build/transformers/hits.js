"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = __importDefault(require("./context"));
exports.default = (result, userId) => {
    const context = context_1.default.make(userId);
    return result.hits.hits.map(hit => {
        let resultHit = hit._source;
        context.setContext(resultHit);
        // remove large amount of data to minimize JSON
        delete resultHit.participants;
        delete resultHit.subscribers;
        return resultHit;
    });
};
