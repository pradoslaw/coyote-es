import Hit from "../types/hit";
import {Context} from '../types/context';
import {User} from "../types/user";

interface ContextStrategy {
  readonly context: Context;

  establish(hit: Hit, userId: User): boolean;
}

class UserContext implements ContextStrategy {
  readonly context: Context = Context.User;

  establish(hit: Hit, userId: User): boolean {
    return userId ? hit.user_id === userId : false;
  }
}

class SubscriberContext implements ContextStrategy {
  readonly context: Context = Context.Subscriber;

  establish(hit: Hit, userId: User): boolean {
    return userId && Array.isArray(hit.subscribers) ? hit.subscribers.includes(userId) : false;
  }
}

class ParticipantContext implements ContextStrategy {
  readonly context: Context = Context.Participant;

  establish(hit: Hit, userId: User): boolean {
    return userId && Array.isArray(hit.participants) ? hit.participants.includes(userId) : false;
  }
}

class ContextManager {
  private strategies: ContextStrategy[] = [];
  private readonly userId: User;

  constructor(userId: User) {
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
  static make(userId: User) {
    return new ContextManager(userId)
      .addStrategy(new UserContext())
      .addStrategy(new ParticipantContext())
      .addStrategy(new SubscriberContext());
  }
}
