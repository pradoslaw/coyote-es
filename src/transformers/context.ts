import Hit from "../models/hit";
import {Model} from '../models/model';
import {Context} from '../models/context';

interface ContextStrategy {
  readonly context: Context;

  establish(hit: Hit, userId?: number): boolean;
}

class UserTopicContext implements ContextStrategy {
  readonly context: Context = Context.UserTopic;

  establish(hit: Hit, userId?: number): boolean {
    return userId ? hit.user_id === userId && hit.model == Model.Topic : false;
  }
}

class UserJobContext implements ContextStrategy {
  readonly context: Context = Context.UserJob;

  establish(hit: Hit, userId?: number): boolean {
    return userId ? hit.user_id === userId && hit.model == Model.Job : false;
  }
}

class SubscribedTopicContext implements ContextStrategy {
  readonly context: Context = Context.SubscribedTopic;

  establish(hit: Hit, userId?: number): boolean {
    return userId && hit.model === Model.Topic ? hit.subscribers.includes(userId) : false;
  }
}

class SubscribedJobContext implements ContextStrategy {
  readonly context: Context = Context.SubscribedJob;

  establish(hit: Hit, userId?: number): boolean {
    return userId && hit.model === Model.Job ? hit.subscribers.includes(userId) : false;
  }
}

class ParticipantTopicContext implements ContextStrategy {
  readonly context: Context = Context.ParticipantTopic;

  establish(hit: Hit, userId?: number): boolean {
    return userId && hit.model === Model.Topic ? hit.participants.includes(userId) : false;
  }
}

class TopicContext implements ContextStrategy {
  readonly context: Context = Context.Topic;

  establish(hit: Hit, userId?: number): boolean {
    return hit.model === Model.Topic;
  }
}

class JobContext implements ContextStrategy {
  readonly context: Context = Context.Job;

  establish(hit: Hit, userId?: number): boolean {
    return hit.model === Model.Job;
  }
}

class ContextManager {
  private strategies: ContextStrategy[] = [];
  private readonly userId: number | undefined;

  constructor(userId?: number) {
    this.userId = userId;
  }

  addStrategy(strategy: ContextStrategy) {
    this.strategies.push(strategy);

    return this;
  }

  setContext(hit: Hit): Hit {
    for (let strategy of this.strategies) {
      if (strategy.establish(hit, this.userId)) {
        hit.context = strategy.context;

        return hit;
      }
    }

    return hit;
  }
}

export default class ContextFactory {
  static make(userId: number) {
    return new ContextManager(userId)
      .addStrategy(new UserTopicContext())
      .addStrategy(new ParticipantTopicContext())
      .addStrategy(new SubscribedTopicContext())
      .addStrategy(new UserJobContext())
      .addStrategy(new SubscribedJobContext())
      .addStrategy(new TopicContext())
      .addStrategy(new JobContext())
  }
}
