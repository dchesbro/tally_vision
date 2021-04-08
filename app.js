var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// pass socket to response
app.use(function(req, res, next) {
  res.io = io;
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

// ...
app.set('categories', require('./categories'));
app.set('contestants', require('./contestants/2021'));

var appUserCount = 0;
var appVoting = null;

// ...
io.on('connection', function(socket) {
  // ...
  socket.on('clientGraham', function(args) {
    console.log(args);
  });

  // ...
  socket.on('clientJoin', function(args) {
    console.log(args);
  });

  // ...
  socket.on('clientVote', function(args) {
    console.log(args);
  });

  // ...
  socket.on('hostClose', function(args) {
    console.log(args);
  });

  // ...
  socket.on('hostJoin', function(args) {
    console.log(args);
  });

  // ...
  socket.on('hostOpen', function(args) {
    console.log(args);
  });
});

module.exports = {
  app: app,
  server: server,
};
