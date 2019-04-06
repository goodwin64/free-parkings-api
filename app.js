const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes');
const parkingsRouter = require('./routes/parkings');
const areaRouter = require('./routes/areaRouter');
const authRouter = require('./routes/authRouter');
// const basicAuth = require('./helpers/basic-auth');
const errorHandler = require('./helpers/error-handler');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// use basic HTTP auth to secure the api
// app.use(basicAuth);

// global error handler
app.use(errorHandler);

// api routes
app.use('/', indexRouter);
app.use('/parkings', parkingsRouter);
app.use('/area', areaRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

module.exports = app;
