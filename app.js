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

// app variables
var appBallot = {};
var appCategories = require('./categories');
var appContestants = require('./contestants/2021');
var appHost = idHost();
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
app.use('/' + appHost, routerHost);

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
  resultCategories();

  socket.on('hostBallotClose', function() {
    hostBallotClose();
  });

  socket.on('hostBallotOpen', function(i) {
    hostBallotOpen(i);
  });
});

// ...
function idHost() {
  return Math.random().toString(36).substr(2, 4);
}

// check if defined object is empty
function isEmpty(a) {
  return Object.keys(a).length === 0;
}

// get voter index from socket name
function appVoterGet(socket, callback) {
  callback(appVoters.findIndex(function(a) {
    return a.name === socket.name;
  }));
}

// emit ballot events to defined socket
function clientBallotOpen(socket, vote) {
  socket.emit('appBallotOpen', appBallot);

  if (vote) {
    socket.emit('appVoted', vote.score);
  }
}

// update list of voters, emit client connected events to defined socket
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
  
      appVoters.sort(function(a, b) {
        return (a.name > b.name) ? 1 : -1;
      });
    }
  });

  socket.emit('clientConnect', socket.name);

  dbVoterAll(socket, clientScorecard);

  if (!isEmpty(appBallot)) {
    dbVoterSingle(socket, appBallot.code, clientBallotOpen);
  }

  hostVoters();
}

// update list of voters for defined socket
function clientDisconnect(socket) {
  appVoterGet(socket, function(i) {
    if (i !== -1) {
      appVoters[i].connected = false;
    }
  });

  hostVoters();
}

// emit scorecard events to defined socket
function clientScorecard(socket, votes) {
  if (votes) {
    socket.emit('clientScorecard', votes);
  }
}

// get total score for all contestants
function dbContestantTotal(callback) {
  var sql = `SELECT contestant,COUNT(voter) votes,SUM(score) score FROM votes GROUP BY contestant ORDER BY score DESC;`;

  db.all(sql, function(err, rows) {
    if (!err) {
      callback(rows);
    }
  });
}

// get defined category score for all contestants 
function dbContestantCategory(category, callback) {
  var sql = `SELECT contestant,COUNT(voter) votes,SUM(category_` + category + `) score FROM votes GROUP BY contestant ORDER BY score DESC;`;

  db.all(sql, function(err, rows) {
    if (!err) {
      callback(rows);
    }
  });
}

// create database tables
function dbTableCreate() {
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

// add vote for defined socket and current contestant
function dbVoteInsert(socket, scores) {
  var columns, placeholders, sql, total;
  var values = [socket.name, appBallot.code].concat(scores);

  columns = appCategories.map(function(category) {
    return `category_` + category.title;
  }).join(`,`);

  placeholders = appCategories.map(function() {
    return `?`;
  }).join(`,`);

  sql  = `INSERT INTO votes (`;
  sql += `voter,`;
  sql += `contestant,` + columns + `,score) VALUES (?,?,` + placeholders + `,?);`;

  total = scores.reduce(function(a, b) {
    return a + b;
  }, 0);

  values.push(total);

  db.run(sql, values, function(err) {
    if (!err) {
      socket.emit('appVoted', total);

      appVoterGet(socket, function(i) {
        if (i !== -1) {
          appVoters[i].voted = true;
        }
      });

      dbContestantTotal(hostScoreboard);
      dbVoterAll(socket, clientScorecard);
      hostVoters();
    }
  });
}

// get all votes for defined socket
function dbVoterAll(socket, callback) {
  var sql = `SELECT id,voter,contestant,score FROM votes WHERE voter=?;`;

  db.all(sql, [socket.name], function(err, rows) {
    if (!err) {
      callback(socket, rows);
    }
  });
}

// get vote for defined socket and contestant
function dbVoterSingle(socket, contestant, callback) {
  var sql = `SELECT id,voter,contestant,score FROM votes WHERE voter=? AND contestant=?;`;

  db.get(sql, [socket.name, contestant], function(err, row) {
    if (!err) {
      callback(socket, row);
    }
  });
}

// emit ballot close events to all clients and host
function hostBallotClose() {
  appBallot = {};

  for (let [i, voter] of appVoters.entries()) {
    appVoters[i].voted = false;

    hostVoters();
  }

  client.emit('appBallotClose');
  host.emit('appBallotClose');
}

// emit ballot open events to all clients and host
function hostBallotOpen(i) {
  appBallot = appContestants[i];

  for (let [i, voter] of appVoters.entries()) {
    dbVoterSingle(voter, appBallot.code, function(voter, vote) {
      if (vote) {
        appVoters[i].voted = true;
      }

      hostVoters();
    });
  }

  for (let [id, socket] of client.sockets) {
    dbVoterSingle(socket, appBallot.code, clientBallotOpen);
  }

  host.emit('appBallotOpen', appBallot);
}

// emit host connected events
function hostConnect() {
  if (!isEmpty(appBallot)) {
    host.emit('appBallotOpen', appBallot);
  } else {
    host.emit('appBallotClose');
  }

  dbContestantTotal(hostScoreboard);
  hostVoters();
}

// emit scorecard events to host
function hostScoreboard(scores) {
  host.emit('hostScoreboard', scores);
}

// emit voters events to host
function hostVoters() {
  if (!isEmpty(appVoters)) {
    host.emit('hostVoters', appVoters);
  }
}

// ...
function resultTotal() {
  dbContestantTotal(function(scores) {
    console.log(scores);
  });
}

// ...
function resultCategories() {
  for (let [i, category] of appCategories.entries()) {
    dbContestantCategory(category.title, function(results) {
      for (let [i, result] of results.entries()) {
        results[i].contestant = appContestants.find(function(a) {
          return a.code === result.contestant;
        });
      }
      
      host.emit('pcaCategory', category.title, results.slice(0, 3));
    });
  }
}



console.log(appHost);

dbTableCreate();



module.exports = {
  app: app,
  server: server,
};
