import * as express from "express";
import jwt from "express-jwt";

export default function jwtHandler(credentialsRequired: boolean) {
  return [
    jwt({secret: process.env.APP_KEY!, credentialsRequired}),
    (req: express.Request, res: express.Response, next: Function) => {
      if (req.user) {
        req.user.iss = parseInt(String(req.user.iss))
      }

      next();
    }
  ];
}
