import * as elasticsearch from "../types/elasticsearch";
import ContextFactory from "./context";
import Hit from '../types/hit';
import allowed from "./allowed";
import {JwtPayload} from "jsonwebtoken";

export default (result: elasticsearch.ElasticsearchResult, user: JwtPayload) => {
  const context = ContextFactory.make(user.iss! as unknown as number);

  return result.hits.hits
    .map(hit => {
      let resultHit:Hit = hit._source;

      context.setContext(resultHit);

      // remove large amount of data to minimize JSON
      delete resultHit.participants;
      delete resultHit.subscribers;

      if (resultHit.text) {
        resultHit.text = resultHit.text.substr(0, 200);
      }

      return resultHit;
    })
    .filter(hit => {
      return allowed(hit, user);
    });
}
