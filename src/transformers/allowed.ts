import Hit from "../types/hit";
import { Model } from"../types/model";

export default (hit: Hit, user?: Jwt): boolean => {
  if (hit.model !== Model.Topic) {
    return true;
  }

  if (hit.forum?.is_prohibited && !user) {
    return false;
  }

  return user ? user.allowed.includes(hit.forum!.id) : true;
}
