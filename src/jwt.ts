import * as express from "express";
import {expressjwt as jwt} from "express-jwt";

export default function jwtHandler(credentialsRequired: boolean) {
  return [
    jwt({secret: process.env.APP_KEY!, credentialsRequired, algorithms: ['HS256']}),
    (req: express.Request, res: express.Response, next: Function) => {
      if (req.user) {
        req.user.iss = parseInt(String(req.user.iss));
      }

      next();
    }
  ];
}
