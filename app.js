var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');

var routerClient = require('./routes/client');
var routerHost = require('./routes/host');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// ...
var clients = io.of('/client');
var host = io.of('/host');

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

app.use('/', routerClient);
app.use('/host', routerHost);

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

var appBallot = [];
var appUsers = [];

// ...
function hostUsers() {
  /* for (let [id, socket] of clients.sockets) {
    appUsers.push({
      username: socket.username,
    });
  } */

  appUsers.sort(function(a, b) {
    var result = 0;
    
    if (a.username > b.username) {
      result = 1;
    }
    if (a.username < b.username) {
      result = -1;
    }
    
    return result;
  });

  host.emit('hostUsers', appUsers);
}

function randomID() {
  return Math.floor(10000 + Math.random() * 90000);
}

// ...
clients.use(function(socket, next) {
  var auth = socket.handshake.auth;

  if (auth.client) {
    if (auth.sessionID) {
      var session = sessionFind(auth.sessionID);

      if (session) {
        socket.sessionID = sessionID;
        socket.userID = session.userID;
        socket.username = session.username;
        
        return next();
      }
    }

    if (!auth.username) {
      return next(new Error('missing username'));
    }

    socket.sessionID = randomID();
    socket.userID = randomID();
    socket.username = auth.username;
  }

  next();
});

clients.on('connection', function(socket) {
  // ...
  appUsers.push({
    connected: true,
    username: socket.username,
  });

  socket.emit('clientJoin', {
    sessionID: socket.sessionID,
    userID: socket.userID,
    username: socket.username,
  });

  hostUsers();
});

// ...
host.on('connection', function(socket) {
  hostUsers();
});

/* ...
io.use(function(socket, next) {
  var auth = socket.handshake.auth;

  if (auth.client) {
    if (auth.sessionID) {
      var session = sessionFind(auth.sessionID);

      if (session) {
        socket.sessionID = sessionID;
        socket.userID = session.userID;
        socket.username = session.username;
        
        return next();
      }
    }

    if (!auth.username) {
      return next(new Error('missing username'));
    }

    socket.sessionID = randomID();
    socket.userID = randomID();
    socket.username = auth.username;
  }

  next();
});

io.on('connection', function(socket) {
  if (socket.username) {

  }

  appUsers = [];

  appUsers.push({
    id: socket.id,
    username: socket.username,
  });
  appUsers.sort(function(a, b) {
    var result = 0;
    
    if (a.username > b.username) {
      result = 1;
    }
    if (a.username < b.username) {
      result = -1;
    }
    
    return result;
  });
  socket.emit('appUsers', appUsers);

  socket.emit('clientJoin', {
    sessionID: socket.sessionID,
    userID: socket.userID,
    username: socket.username,
  });

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
});*/

module.exports = {
  app: app,
  server: server,
};
