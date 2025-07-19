var createError = require('http-errors');
var dotenv = require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('./services/passport')

var cors = require('cors');
// var getPlaylist = require('./routes/getPlaylist');
// var searchVideos = require('./routes/search');
// var saveVideo = require('./routes/saveVideo');
// var user = require('./routes/user');

// var mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: 'http://localhost:3000' }));

//  DB SETUP
// mongoose.connect(process.env.MONGODB_URI)
//
// app.use(morgan('combined'));
// app.use(bodyParser.json({ type: '*/*' }));

const routes = require('./routes');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
