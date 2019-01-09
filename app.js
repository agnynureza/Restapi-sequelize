const express = require('express');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const redis = require('redis');
const client = redis.createClient();
const app = express();


client.on('connect', function() {
    console.log('Redis client connected !');
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);

module.exports = app;
