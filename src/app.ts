import express = require('express');
const logger = require('morgan');
import dotenv from 'dotenv';

dotenv.config({path: '.env'});

// Create a new express application instance
const app: express.Application = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

import SuggestionController from './routes/suggestions';
import HubController from './routes/hub';
import HealtcheckController from './routes/healtcheck';

app.use('/', new SuggestionController().router);
app.use('/hub', new HubController().router);
app.use('/healtcheck', new HealtcheckController().router);

const server = app.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}`));

const shutdown = () => {
  console.log("Gracefully stopping server...");

  server.close(() => console.log(`server stopped`));
};

process.on('SIGHUP', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
