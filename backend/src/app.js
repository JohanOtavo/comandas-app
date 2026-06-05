require('dotenv').config();

const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const basePath = process.env.BASE_PATH || '/comandas';

function healthHandler(req, res) {
  res.json({ ok: true, message: 'API de comandas funcionando' });
}

app.get('/health', healthHandler);
app.get(`${basePath}/health`, healthHandler);
app.use('/api', routes);
app.use(`${basePath}/api`, routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
