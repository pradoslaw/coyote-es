import Hit from "../types/hit";
import { Model } from"../types/model";

export default (hit: Hit, user?: Jwt): boolean => {
  if ((hit.model !== Model.Topic) || !(hit.forum?.is_prohibited)) {
    return false;
  }

  if (!user) {
    return true;
  }

  return !user.guarded.length ? false : user.guarded.includes(hit.forum.id);
}
