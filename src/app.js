const express = require('express');
const cors = require('cors');
const orm = require('./models');
const router = require('./router');

const app = express();

app.use((req, res, next) => {
  req.orm = orm;
  next();
});

app.use(express.json());

app.use(cors());

app.use('/', router);

module.exports = app;
