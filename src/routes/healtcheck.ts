import * as express from 'express';
import asyncHandler from 'express-async-handler';

export default class HealtcheckController {
  public router = express.Router();

  constructor() {
    this.router.get('/', asyncHandler(async (req: express.Request, res: express.Response) => {
      res.send('OK');
    }));
  }
};
