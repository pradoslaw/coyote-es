import Hit from "../types/hit";
import { Model } from"../types/model";

export default (hit: Hit, user?: Jwt): boolean => {
  if ((hit.model !== Model.Topic) || !(hit.forum?.is_prohibited)) {
    return true;
  }

  return user ? user.prohibited.includes(hit.forum.id) : false;
}
