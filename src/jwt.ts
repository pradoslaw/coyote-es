import * as express from "express";
import { expressjwt } from "express-jwt";

export default function jwtHandler(credentialsRequired: boolean) {
  return [
    expressjwt({secret: process.env.APP_KEY!, credentialsRequired, algorithms: ["HS256"]}),
  ];
}
