"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../models/model");
const context_1 = require("../models/context");
class UserTopicContext {
    constructor() {
        this.context = context_1.Context.UserTopic;
    }
    establish(hit, userId) {
        // hit.suggest
        return userId ? hit.user_id === userId && hit.model == model_1.Model.Topic : false;
    }
}
class UserJobContext {
    constructor() {
        this.context = context_1.Context.UserJob;
    }
    establish(hit, userId) {
        return userId ? hit.user_id === userId && hit.model == model_1.Model.Job : false;
    }
}
class SubscribedTopicContext {
    constructor() {
        this.context = context_1.Context.SubscribedTopic;
    }
    establish(hit, userId) {
        return userId && hit.model === model_1.Model.Topic ? hit.subscribers.includes(userId) : false;
    }
}
class SubscribedJobContext {
    constructor() {
        this.context = context_1.Context.SubscribedJob;
    }
    establish(hit, userId) {
        return userId && hit.model === model_1.Model.Job ? hit.subscribers.includes(userId) : false;
    }
}
class ParticipantTopicContext {
    constructor() {
        this.context = context_1.Context.ParticipantTopic;
    }
    establish(hit, userId) {
        return userId && hit.model === model_1.Model.Topic ? hit.participants.includes(userId) : false;
    }
}
class TopicContext {
    constructor() {
        this.context = context_1.Context.Topic;
    }
    establish(hit, userId) {
        return hit.model === model_1.Model.Topic;
    }
}
class JobContext {
    constructor() {
        this.context = context_1.Context.Job;
    }
    establish(hit, userId) {
        return hit.model === model_1.Model.Job;
    }
}
class UserContext {
    constructor() {
        this.context = context_1.Context.User;
    }
    establish(hit, userId) {
        return hit.model === model_1.Model.User;
    }
}
class ContextManager {
    constructor(userId) {
        this.strategies = [];
        this.userId = userId;
    }
    addStrategy(strategy) {
        this.strategies.push(strategy);
        return this;
    }
    setContext(hit) {
        for (let strategy of this.strategies) {
            if (strategy.establish(hit, this.userId)) {
                hit.context = strategy.context;
                return hit;
            }
        }
        return hit;
    }
}
class ContextFactory {
    static make(userId) {
        return new ContextManager(userId)
            .addStrategy(new UserTopicContext())
            .addStrategy(new ParticipantTopicContext())
            .addStrategy(new SubscribedTopicContext())
            .addStrategy(new UserJobContext())
            .addStrategy(new SubscribedJobContext())
            .addStrategy(new TopicContext())
            .addStrategy(new JobContext())
            .addStrategy(new UserContext());
    }
}
exports.default = ContextFactory;
