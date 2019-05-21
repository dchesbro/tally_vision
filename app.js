var cookieParser   = require('cookie-parser'); // HTTP cookie parser
var express        = require('express');       // Application framework
var createError    = require('http-errors');   // Create HTTP error objects
var mongoose       = require('mongoose');      // MongoDB object modeling
var logger         = require('morgan');        // HTTP request logger
var path           = require('path');          // File and dir path utilities

// Define Express app instance.
var app            = express();

// Define Socket.IO server.
var server         = require('http').Server(app);
var io             = require('socket.io')(server);

// Define database document models.
var voteModel      = require('./models/vote');

// Define includes.
var categories     = require('./includes/categories');
var contestants    = require('./includes/contestants');

// Define local app variables.
var contestant;
var userCount = 0;

// Define routers.
var adminRouter    = require('./routes/admin');
var usersRouter    = require('./routes/users');

/**
 * ...
 */
function getUserScores(username){
	
	// ...
	voteModel.find({ username: username }, function(err, votes) {
		if(err){

			// Print debug message(s).
			console.log(err.message);
		}else{
			var scores = {};

			votes.forEach(function(vote){
				scores[vote.code] = vote.cat1 + vote.cat2 + vote.cat3 + vote.cat4 + vote.cat5;
			});

			console.log(scores);

			return scores;
		}
	});
}

// Set app variables.
app.set('categories', categories);
app.set('contestants', contestants);

// Set views.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Express app generator setup.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use('/', usersRouter);
app.use('/admin', adminRouter);

// Forward 404 messages to error handler.
app.use(function(req, res, next) {
	next(createError(404));
});

// HTTP error handler.
app.use(function(err, req, res, next) {
	
	// Set local development error messages.
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	
	res.status(err.status || 500);
	res.render('error');
});

// Socket.IO event handlers.
io.on('connection', function(socket){
	
	/*----------------------------------------------------------
	# Admin Socket.IO events
	----------------------------------------------------------*/
	/*----------------------------------------------------------
	## Ballot events
	----------------------------------------------------------*/
	/**
	 * Set contestant using defined index and open voting.
	 */
	socket.on('ballot-open', function(index){

		// If contestant set, return.
		if(contestant){
			return;
		}

		// Set contestant using contestant index.
		contestant = contestants[index];

		// Send 'ballot-open' event (to everyone).
		io.sockets.emit('ballot-open', contestant);
		
		// Print debug message(s).
		console.log('IO Opening ballot for "' + contestant.country + '"');
	});
	
	/**
	 * Close voting and set contestant to null.
	 */
	socket.on('ballot-close', function(){

		// If contestant not set, return.
		if(!contestant){
			return;
		}

		// Set contestant to null.
		contestant = null;

		// Send 'ballot-close' event (to everyone).
		io.sockets.emit('ballot-close');
		
		// Print debug message(s).
		console.log('IO Closing ballot');
	});

	/*----------------------------------------------------------
	## Connection events
	----------------------------------------------------------*/
	/**
	 * Register socket as admin.
	 */
	socket.on('admin-register', function(){

		// Set admin as socket properties.
		socket.admin = true;
		
		// Send 'admin-register' event (to sender).
		socket.emit('admin-register', userCount);
		
		// Print debug message(s).
		console.log('IO Registered socket ID ' + socket.id + ' as admin');
		
		// If contestant set, send 'ballot-open' event to registered socket.
		if(contestant){
			
			// Send 'ballot-open' event (sender).
			socket.emit('ballot-open', contestant);
		
			// Print debug message(s).
			console.log('IO Opening ballot "' + contestant.country + '" for admin');
		}
	});
	
	/*----------------------------------------------------------
	# User Socket.IO events
	----------------------------------------------------------*/
	/*----------------------------------------------------------
	## Ballot events
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	socket.on('ballot-total', function(code){
		
		// ...
		voteModel.find({ contestant: code }, function(err, votes) {
			if (err) throw err;

			// object of all the users
			console.log(votes);
		});
	});
	
	/**
	 * ...
	 */
	socket.on('ballot-vote', function(scores){
		
		// If socket not registered or contestant not set, return.
		if(!socket.registered || !contestant){
			return;
		}

		// Print debug message(s).
		console.log('IO Registered user "' + socket.username + '" submitted scores for "' + contestant.country + '"');

		// Parse scores as integers and define vote object.
		var vote = new voteModel({
			username: socket.username,
			code: contestant.code,
			cat1: parseInt(scores.cat1),
			cat2: parseInt(scores.cat2),
			cat3: parseInt(scores.cat3),
			cat4: parseInt(scores.cat4)
		});

		// Save vote to database.
		vote.save(function(err, vote){
			if(err){

				// Print debug message(s).
				console.log(err);
			}else{

				// Send 'ballot-vote' event (to sender).
				socket.emit('ballot-vote', vote);

				// Print debug message(s).
				console.log('DB Saved vote ID ' + vote._id);
			}
		});
	});

	/*----------------------------------------------------------
	## Connection events
	----------------------------------------------------------*/
	/**
	 * Decrease user count on disconnect.
	 */
	socket.on('disconnect', function(){

		// If socket not registered, return.
		if(!socket.registered){
			return;
		}

		// Decrease registered user count.
		userCount--;

		// Send 'user-disconected' event (to everyone).
		io.sockets.emit('user-disconnected', { username: socket.username, userCount });
		
		// Print debug message(s).
		console.log('IO Registered user "' + socket.username + '" disconnected');
		console.log('IO ' + userCount + ' user(s) registered');
	});

	/**
	 * Register socket as user, increase user count, and check for open ballot.
	 */
	socket.on('user-register', function(username){
		
		// If socket registered, return.
		if(socket.registered){
			return;
		}

		// Set username and registered as socket properties.
		socket.username = username;
		socket.registered = true;

		// Increase registered user count.
		userCount++;
		
		// Send 'user-register' event (to sender).
		socket.emit('user-register');

		// Send 'user-registered' event (to everyone).
		io.sockets.emit('user-registered', { username: socket.username, userCount });
		
		// Print debug message(s).
		console.log('IO Registered socket ID ' + socket.id + ' as user "' + socket.username + '"');
		console.log('IO ' + userCount + ' user(s) registered');
		
		// If contestant set, send 'ballot-open' event to registered socket.
		if(contestant){
			
			// Send 'ballot-open' event (sender).
			socket.emit('ballot-open', contestant);
		
			// Print debug message(s).
			console.log('IO Opening ballot "' + contestant.country + '" for user "' + socket.username + '"');
		}
	});
});

// Open database connection.
mongoose.connect('mongodb://localhost/tallyvision', {useNewUrlParser: true});

module.exports = { app: app, server: server };
