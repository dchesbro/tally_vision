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
var db = new sqlite3.Database('./' + new Date().toISOString().substring(0, 10) + '.db');

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



// client auth
client.use(function(socket, next) {
  var auth = socket.handshake.auth;

  if (!auth.name) {
    return next(new Error('missing name'));
  }

  socket.name = auth.name.toLowerCase();

  next();
});

// client events
client.on('connection', function(socket) {
  clientConnect(socket);

  socket.on('clientBallotSubmit', function(scores) {
    dbVoteInsert(socket, scores);
  });
  
  socket.on('disconnect', function() {
    clientDisconnect(socket);
  });
});



// host events
host.on('connection', function(socket) {
  hostConnect();

  socket.on('hostBallotClose', function() {
    hostBallotClose();
  });

  socket.on('hostBallotOpen', function(i) {
    hostBallotOpen(i);
  });
});



// ...
function isEmpty(a) {
  return Object.keys(a).length === 0;
}



// ...
function appVoterGet(socket, callback) {
  callback(appVoters.findIndex(function(a) {
    return a.name === socket.name;
  }));
}

// ...
function appVoterSort() {
  appVoters.sort(function(a, b) {
    return (a.name > b.name) ? 1 : -1;
  });
}



// ...
function clientBallotOpen(socket, vote) {
  socket.emit('appBallotOpen', appBallot);

  if (vote) {
    socket.emit('appVoted', vote.score);

    clientVoted(socket, true);
  }

  hostVoters();
}

// ...
function clientConnect(socket) {
  appVoterGet(socket, function(i) {
    if (i !== -1) {
      appVoters[i].connected = true;
    } else {
      appVoters.push({
        connected: true,
        name: socket.name,
        voted: false,
      });
  
      appVoterSort();
    }
  });

  socket.emit('clientConnect', socket.name);

  dbVoterAll(socket, clientScorecard);

  if (!isEmpty(appBallot)) {
    dbVoterGet(socket, appBallot.code, clientBallotOpen);
  }

  hostVoters();
}

// ...
function clientDisconnect(socket) {
  appVoterGet(socket, function(i) {
    if (i !== -1) {
      appVoters[i].connected = false;
    }
  });

  hostVoters();
}

// ...
function clientScorecard(socket, votes) {
  if (votes) {
    socket.emit('clientScorecard', votes);
  }
}

// ...
function clientVoted(socket, voted) {
  appVoterGet(socket, function(i) {
    if (i !== -1) {
      appVoters[i].voted = voted;
    }
  });
}



// ...
function dbContestantAll(callback) {
  var sql = `SELECT contestant,COUNT(voter) votes,SUM(score) score FROM votes GROUP BY contestant;`;

  db.all(sql, function(err, rows) {
    if (!err) {
      callback(rows);
    }
  });
}

// ...
function dbTablesCreate() {
  var columns, sql;

  columns = appCategories.map(function(category) {
    return `category_` + category.title + ` INTEGER NOT NULL`;
  }).join(`,`);

  sql  = `CREATE TABLE IF NOT EXISTS votes (`;
  sql += `id INTEGER PRIMARY KEY AUTOINCREMENT,`;
  sql += `voter TEXT NOT NULL,`;
  sql += `contestant TEXT NOT NULL,` + columns + `,score INTEGER NOT NULL);`;

  db.run(sql, function(err) {});
}

// ...
function dbVoteInsert(socket, scores) {
  var columns, placeholders, score, sql;
  var values = [socket.name, appBallot.code].concat(scores);

  columns = appCategories.map(function(category) {
    return `category_` + category.title;
  }).join(`,`);

  placeholders = appCategories.map(function() {
    return `?`;
  }).join(`,`);

  score = scores.reduce(function(a, b) {
    return a + b;
  }, 0);

  sql  = `INSERT INTO votes (`;
  sql += `voter,`;
  sql += `contestant,` + columns + `,score) VALUES (?,?,` + placeholders + `,?);`;

  values.push(score);

  db.run(sql, values, function(err) {
    if (!err) {
      socket.emit('appVoted', score);

      clientVoted(socket, true);
      dbContestantAll(hostScoreboard);
      dbVoterAll(socket, clientScorecard);
      hostVoters();
    }
  });
}

// ...
function dbVoterAll(socket, callback) {
  var sql = `SELECT id,voter,contestant,score FROM votes WHERE voter=?;`;

  db.all(sql, [socket.name], function(err, rows) {
    if (!err) {
      callback(socket, rows);
    }
  });
}

// ...
function dbVoterGet(socket, contestant, callback) {
  var sql = `SELECT id,voter,contestant,score FROM votes WHERE voter=? AND contestant=?;`;

  db.get(sql, [socket.name, contestant], function(err, row) {
    if (!err) {
      callback(socket, row);
    }
  });
}



// ...
function hostBallotClose() {
  appBallot = {};

  for (let [id, socket] of client.sockets) {
    clientVoted(socket, false);
  }

  client.emit('appBallotClose');
  host.emit('appBallotClose');

  hostVoters();
}

// ...
function hostBallotOpen(i) {
  appBallot = appContestants[i];

  for (let [id, socket] of client.sockets) {
    clientVoted(socket, false);
    dbVoterGet(socket, appBallot.code, clientBallotOpen);
  }

  host.emit('appBallotOpen', appBallot);

  hostVoters();
}

// ...
function hostConnect() {
  if (!isEmpty(appBallot)) {
    host.emit('appBallotOpen', appBallot);
  } else {
    host.emit('appBallotClose');
  }

  dbContestantAll(hostScoreboard);
  hostVoters();
}

// ...
function hostScoreboard(scores) {
  host.emit('hostScoreboard', scores);
}

// ...
function hostVoters() {
  if (!isEmpty(appVoters)) {
    host.emit('hostVoters', appVoters);
  }
}



dbTablesCreate();



module.exports = {
  app: app,
  server: server,
};
