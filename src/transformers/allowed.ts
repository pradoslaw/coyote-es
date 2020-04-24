import Hit from "../types/hit";
import { Model } from"../types/model";

export default (hit: Hit, user?: Jwt): boolean => {
  if ((hit.model !== Model.Topic) || !(hit.forum?.is_prohibited)) {
    return true;
  }

  if (!user) {
    return false;
  }

  return !user.allowed.length ? true : user.allowed.includes(hit.forum.id);
}
