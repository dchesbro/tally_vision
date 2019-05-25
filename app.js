var cookieParser = require('cookie-parser'); // HTTP cookie parser
var express      = require('express');       // Application framework
var createError  = require('http-errors');   // Create HTTP error objects
var mongoose     = require('mongoose');      // MongoDB object modeling
var logger       = require('morgan');        // HTTP request logger
var path         = require('path');          // File and dir path utilities

// Define Express app instance.
var app          = express();

// Define Socket.IO server.
var server       = require('http').Server(app);
var io           = require('socket.io')(server);

// Define database document models.
var voteModel    = require('./models/vote');

// Define includes.
var categories   = require('./includes/categories');
var contestants  = require('./includes/contestants');

// Define local app variables.
var contestant;
var userCount = 0;

// Define routers.
var hostRouter   = require('./routes/host');
var screenRouter = require('./routes/screen');
var userRouter   = require('./routes/user');

// Set app variables.
app.set('categories', categories);
app.set('contestants', contestants);

// Set views.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Express app generator setup.
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use('/', userRouter);
app.use('/host', hostRouter);
app.use('/screen', screenRouter);

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
	# Local app functions
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	function hostUpdateTable(){

		// ...
		voteModel.aggregate([
			{ $group: {
				_id: '$code',
				score: { $sum: '$total' },
				votes: { $sum: 1 }
			} }
		], function(err, contestantsData){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{

				// Send global response.
				io.sockets.emit('hostUpdateTable', contestantsData);

				// Print debug message(s).
				console.log('IO Updating contestants table for host');
			}
		});
	}

	/**
	 * ...
	 */
	function resultsOverall(){
		
		// ...
		voteModel.aggregate([
			{ $group: {
				_id: '$code',
				score: { $sum: '$total' },
				votes: { $sum: 1 }
			} },
			{ $sort: {
				score: -1
			} }
		], function(err, resultsData){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{

				// Print debug message(s).
				console.log('RESULTS: Best Overall');
				console.log(resultsData);
			}
		});
		
		// ...
		voteModel.aggregate([
			{ $group: {
				_id: '$code',
				score: { $sum: '$cat1' }
			} },
			{ $sort: {
				score: -1
			} }
		], function(err, resultsData){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{

				// Print debug message(s).
				console.log('RESULTS: Best Song');
				console.log(resultsData);
			}
		});
		
		// ...
		voteModel.aggregate([
			{ $group: {
				_id: '$code',
				score: { $sum: '$cat2' }
			} },
			{ $sort: {
				score: -1
			} }
		], function(err, resultsData){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{

				// Print debug message(s).
				console.log('RESULTS: Best Performance');
				console.log(resultsData);
			}
		});
		
		// ...
		voteModel.aggregate([
			{ $group: {
				_id: '$code',
				score: { $sum: '$cat3' }
			} },
			{ $sort: {
				score: -1
			} }
		], function(err, resultsData){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{

				// Print debug message(s).
				console.log('RESULTS: Best Staging');
				console.log(resultsData);
			}
		});
		
		// ...
		voteModel.aggregate([
			{ $group: {
				_id: '$code',
				score: { $sum: '$cat4' }
			} },
			{ $sort: {
				score: -1
			} }
		], function(err, resultsData){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{

				// Print debug message(s).
				console.log('RESULTS: Best Wardrobe');
				console.log(resultsData);
			}
		});
	}

	/**
	 * ...
	 */
	function resultsUsers(){
		
		// ...
		voteModel.aggregate([
			{ $sort: {
				cat1: -1
			} },
			{ $group: {
				_id: '$username',
				code: { $first: '$code' },
				score: { $first: '$cat1' },
			} },
			{ $sort: {
				_id: 1
			} }
		], function(err, resultsData){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{

				// Print debug message(s).
				console.log('RESULTS: Best Song Per User');
				console.log(resultsData);
			}
		});

		// ...
		voteModel.aggregate([
			{ $sort: {
				cat2: -1
			} },
			{ $group: {
				_id: '$username',
				code: { $first: '$code' },
				score: { $first: '$cat2' }
			} },
			{ $sort: {
				_id: 1
			} }
		], function(err, resultsData){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{

				// Print debug message(s).
				console.log('RESULTS: Best Performance Per User');
				console.log(resultsData);
			}
		});

		// ...
		voteModel.aggregate([
			{ $sort: {
				cat3: -1
			} },
			{ $group: {
				_id: '$username',
				code: { $first: '$code' },
				score: { $first: '$cat3' }
			} },
			{ $sort: {
				_id: 1
			} }
		], function(err, resultsData){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{

				// Print debug message(s).
				console.log('RESULTS: Best Staging Per User');
				console.log(resultsData);
			}
		});

		// ...
		voteModel.aggregate([
			{ $sort: {
				cat4: -1
			} },
			{ $group: {
				_id: '$username',
				code: { $first: '$code' },
				score: { $first: '$cat4' }
			} },
			{ $sort: {
				_id: 1
			} }
		], function(err, resultsData){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{

				// Print debug message(s).
				console.log('RESULTS: Best Wardrobe Per User');
				console.log(resultsData);
			}
		});
	}

	/**
	 * ...
	 */
	function screenUpdateDisplay(){

		// ...
		voteModel.aggregate([
			{ $match: {
				code: contestant.code
			} },
			{ $group: {
				_id: '$code',
				cat1: { $sum: '$cat1' },
				cat2: { $sum: '$cat2' },
				cat3: { $sum: '$cat3' },
				cat4: { $sum: '$cat4' },
				votes: { $sum: 1 }
			} },
		], function(err, voteData){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{

				// Send global response.
				io.sockets.emit('screenUpdateDisplay', voteData);

				// Print debug message(s).
				console.log('IO Updating contestant chart on screen');
			}
		});
	}
	
	/**
	 * ...
	 */
	function userUpdateTable(){
		
		// Get previously submitted votes for user.
		voteModel.find({ username: socket.username }, 'code total', function(err, contestantsData){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{

				// Send user response.
				socket.emit('userUpdateTable', contestantsData);

				// Print debug message(s).
				console.log('IO Updating contestants table for user "' + socket.username + '"');
			}
		});
	}

	/**
	 * ...
	 */
	function userVoted(){

		// ...
		if(!contestant || !socket.registered){
			return;
		}

		// Get previously submitted vote count for user and contestant.
		var voted = voteModel.countDocuments({ username: socket.username, code: contestant.code }, function(err, count){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{
				
				// If count of previously submitted votes greater than zero, return true...
				if(count > 0){
					return true;
				
				// ...else, assume user has not voted yet and return false.
				}else{
					return false;
				}
			}
		});

		return voted;
	}
	
	/*----------------------------------------------------------
	# Host events
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	socket.on('hostBallotInit', function(index){

		// If contestant set, return.
		if(contestant){
			return;
		}

		// Set contestant using index.
		contestant = contestants[index];

		// Send global response.
		io.sockets.emit('ballotOpen', contestant);
		
		// Print debug message(s).
		console.log('IO Opening ballot for "' + contestant.country + '"');
	});
	
	/**
	 * ...
	 */
	socket.on('hostBallotKill', function(){

		// If no contestant set, return.
		if(!contestant){
			return;
		}

		// Set contestant to null.
		contestant = null;

		// Send global response.
		io.sockets.emit('ballotClose');
		
		// Print debug message(s).
		console.log('IO Closing ballot');
	});

	/**
	 * ...
	 */
	socket.on('hostPrintResults', function(){

		// Print debug message(s).
		console.log('*** BEGIN RESULTS PRINTOUT ***');

		// Call results functions.
		resultsOverall();
		resultsUsers();
	});

	/**
	 * ...
	 */
	socket.on('hostRegister', function(){

		// Set socket host properties.
		socket.host = true;
		
		// Send user event.
		socket.emit('hostRegister', userCount);
		
		// Print debug message(s).
		console.log('IO Registered socket ID ' + socket.id + ' as host');

		// Update contestants table for host.
		hostUpdateTable();
		
		// If contestant set, update host index.
		if(contestant){
			
			// Send user response.
			socket.emit('ballotOpen', contestant);
		
			// Print debug message(s).
			console.log('IO Opening ballot "' + contestant.country + '" for host');
		}
	});

	/*----------------------------------------------------------
	# Screen events
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	socket.on('screenRegister', function(){

		// Set socket screen properties.
		socket.screen = true;
		
		// Print debug message(s).
		console.log('IO Registered socket ID ' + socket.id + ' as screen');
		
		// If contestant set, update host index.
		if(contestant){

			// Update display for screen.
			screenUpdateDisplay();
			
			// Send user response.
			socket.emit('ballotOpen', contestant);
		
			// Print debug message(s).
			console.log('IO Opening ballot "' + contestant.country + '" for screen');
		}
	});
	
	/*----------------------------------------------------------
	# User events
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	socket.on('disconnect', function(){

		// If socket not registered, return.
		if(!socket.registered){
			return;
		}

		// Decrease registered user count.
		userCount--;

		// Send global response.
		io.sockets.emit('userDisconnected', { username: socket.username, userCount });
		
		// Print debug message(s).
		console.log('IO Registered user "' + socket.username + '" disconnected');
		console.log('IO ' + userCount + ' user(s) registered');
	});

	/**
	 * ...
	 */
	socket.on('userBallotVote', function(scores){
		
		// If no contestant set or socket not registered, return.
		if(!contestant || !socket.registered){
			return;
		}

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

				// Update display for screen.
				screenUpdateDisplay();

				// Update contestants table for host and user.
				hostUpdateTable();
				userUpdateTable();

				// Send user response.
				socket.emit('userBallotVote', vote);

				// Print debug message(s).
				console.log('IO Saved vote ID ' + vote._id + ' from user "' + socket.username + '"');
			}
		});
	});

	/**
	 * ...
	 */
	socket.on('userRegister', function(username){
		
		// If socket registered or username property set, return.
		if(socket.registered || socket.username){
			return;
		}

		// Set socket user properties.
		socket.username = username;
		socket.registered = true;

		// Increase registered user count.
		userCount++;
		
		// Send user response.
		socket.emit('userRegister');

		// Send global response.
		io.sockets.emit('userConnected', { username: socket.username, userCount });
		
		// Print debug message(s).
		console.log('IO Registered socket ID ' + socket.id + ' as user "' + socket.username + '"');
		console.log('IO ' + userCount + ' user(s) registered');

		// Update contestants table for user.
		userUpdateTable();
		
		// If contestant set, open ballot.
		if(contestant){
			
			// Send user reponse.
			socket.emit('ballotOpen', contestant);
		
			// Print debug message(s).
			console.log('IO Opening ballot "' + contestant.country + '" for user "' + socket.username + '"');
		}
	});
});

// Open database connection.
mongoose.connect('mongodb://localhost/tallyvision', { useNewUrlParser: true });

module.exports = { app: app, server: server };
