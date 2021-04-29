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
var client = io.of('/client');
var host = io.of('/host');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./' + new Date().toDateString() + '.db');

// ...
var appBallot = {};
var appCategories = require('./categories');
var appContestants = require('./contestants/2021');
var appVoters = [];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('categories', appCategories);
app.set('contestants', appContestants);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false,
}));
app.use(cookieParser());
app.use(sassMiddleware({
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false,
  sourceMap: true,
  src: path.join(__dirname, 'public'),
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
client.use(function(socket, next) {
  var auth = socket.handshake.auth;

  if (!auth.name) {
    return next(new Error('missing name'));
  }

  socket.name = auth.name.toLowerCase();

  next();
});

// ...
client.on('connection', function(socket) {
  clientConnect(socket);

  socket.on('clientBallotSubmit', function(scores) {
    dbInsertVote(socket, scores);
  });
  
  socket.on('disconnect', function() {
    clientDisconnect(socket);
  });
});

// ...
function clientConnect(socket) {
  var [i, voter] = voterGet(socket);

  if (isEmpty(voter)) {
    appVoters.push({
      connected: true,
      name: socket.name,
    });

    voterSort();
  } else {
    appVoters[i].connected = true;
  }

  socket.emit('clientConnect', socket.name);

  if (!isEmpty(appBallot)) {
    socket.emit('appBallotOpen', appBallot);
  }

  hostVoters();
}

// ...
function clientDisconnect(socket) {
  var [i, voter] = voterGet(socket);

  if (!isEmpty(voter)) {
    appVoters[i].connected = false;
  }

  socket.emit('clientDisconnect', socket.name);

  hostVoters();
}



//...
host.on('connection', function(socket) {
  hostConnect();

  socket.on('hostBallotClose', function() {
    appBallot = {};

    client.emit('appBallotClose');
    host.emit('appBallotClose');
  });

  socket.on('hostBallotOpen', function(i) {
    appBallot = appContestants[i];

    client.emit('appBallotOpen', appBallot);
    host.emit('appBallotOpen', appBallot);
  });
});

// ...
function hostConnect() {
  hostBallot();
  hostVoters();
}

// ...
function hostBallot() {
  if (!isEmpty(appBallot)) {
    host.emit('appBallotOpen', appBallot);
  } else {
    host.emit('appBallotClose');
  }
}

// ...
function hostVoters() {
  if (!isEmpty(appVoters)) {
    host.emit('hostVoters', appVoters);
  }
}



// ...
function dbCreateTables() {
  var columns = ``;
  var sql = ``;

  columns = appCategories.map(function(category) {
    return `category_` + category.title + ` INTEGER NOT NULL`;
  }).join(`,`);

  sql += `CREATE TABLE IF NOT EXISTS votes (`;
  sql += `uid INTEGER PRIMARY KEY AUTOINCREMENT,`;
  sql += `voter_name TEXT NOT NULL,`;
  sql += `contestant_code TEXT NOT NULL,` + columns + `);`;

  db.run(sql, function(err) {});
}

dbCreateTables();

// ...
function dbGetVote(name, code, callback) {
  var sql = ``;

  sql = `SELECT uid id FROM votes WHERE voter_name=?`;

  db.get(sql, [name], function(err, row) {
    if (!err) {
      callback(row.id);
    }
  });
}

// ...
function dbInsertVote(socket, scores) {
  var columns = ``;
  var placeholders = ``;
  var sql = ``;
  var values = [socket.name, appBallot.code].concat(scores);

  columns = appCategories.map(function(category) {
    return `category_` + category.title;
  }).join(`,`);

  placeholders = appCategories.map(function() {
    return `?`;
  }).join(`,`);

  sql += `INSERT INTO votes (`;
  sql += `voter_name,`;
  sql += `contestant_code,` + columns + `) VALUES (?,?,` + placeholders + `);`;

  db.run(sql, values, function(err) {
    if (!err) {
      socket.emit('appVoted', scores.reduce(function(a, b) {
        return a + b;
      }, 0));
    }
  });
}

// ...
function isEmpty(a) {
  return Object.keys(a).length === 0;
}

// ...
function voterGet(socket) {
  var result = [null, {}];

  for ([i, voter] of appVoters.entries()) {
    if (voter.name === socket.name) {
      result = [i, voter];
      break;
    }
  }

  return result;
}

// ...
function voterSort() {
  appVoters.sort(function(a, b) {
    var result = -1;
    
    if (a.name > b.name) {
      result = 1;
    }
    
    return result;
  });
}

module.exports = {
  app: app,
  server: server,
};
