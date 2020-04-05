const express = require('express');
const path = require('path');
const logger = require('morgan');

const suggestionRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', suggestionRouter);
app.use('/users', usersRouter);

module.exports = app;
