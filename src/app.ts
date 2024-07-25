import express = require('express');
const logger = require('morgan');
const fs = require('fs');

import dotenv from 'dotenv';

dotenv.config({path: '.env'});

if (process.env.APP_KEY_FILE) {
  const data = fs.readFileSync(process.env.APP_KEY_FILE);

  process.env["APP_KEY"] = data.toString().trim();
}

// Create a new express application instance
const app: express.Application = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

import SuggestionController from './routes/suggestions';
import HubController from './routes/hub';
import HealthcheckController from './routes/healtcheck';
import SearchController from './routes/search';
import PromptController from "./routes/prompt";
import SimilarController from "./routes/similiar";

app.use('/', new SuggestionController().router);
app.use('/hub', new HubController().router);
app.use('/search', new SearchController().router);
app.use('/prompt', new PromptController().router);
app.use('/healthcheck', new HealthcheckController().router);
app.use('/similar', new SimilarController().router);

const server = app.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}`));

const shutdown = () => {
  console.log("Gracefully stopping server...");

  server.close(() => console.log(`server stopped`));
};

process.on('SIGHUP', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
