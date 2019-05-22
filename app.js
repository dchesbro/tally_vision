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
var adminRouter  = require('./routes/admin');
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
	# Local app functions
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	function adminUpdateScores(){

		// ...
		voteModel.aggregate([{
			$group: {
				_id: '$code',
				score: { $sum: '$total' },
				votes: { $sum: 1 } 
			}
		}], function(err, contestantData){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{

				// Send global response.
				io.sockets.emit('adminUpdateScores', contestantData);

				// Print debug message(s).
				console.log('IO Updating contestant data for administrator');
			}
		});

		/* ...
		voteModel.countDocuments({
			code: contestant.code
		}, function(err, result){
			if(err){
				console.log(err);
				return;
			}
			console.log(result);
		}); */
		
		/* Get all previously submitted votes.
		voteModel.find({}, 'code total', function(err, votes){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{

				// Send global response.
				io.sockets.emit('adminUpdateScores', votes);

				// Print debug message(s).
				console.log('IO Updating scores for administrator');
			}
		}); */
	}
	
	/**
	 * ...
	 */
	function userUpdateScores(){
		
		// Get all previously submitted votes for user.
		voteModel.find({ username: socket.username }, 'code total', function(err, userVotes){
			if(err){
				
				// Print debug message(s).
				console.log(err);
			}else{

				// Send user response.
				socket.emit('userUpdateScores', userVotes);

				// Print debug message(s).
				console.log('IO Updating scores for user "' + socket.username + '"');
			}
		});
	}
	
	/*----------------------------------------------------------
	# Admin events
	----------------------------------------------------------*/
	/**
	 * ...
	 */
	socket.on('adminBallotInit', function(index){

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
	socket.on('adminBallotKill', function(){

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
	socket.on('adminRegister', function(){

		// Set socket admin properties.
		socket.admin = true;
		
		// Send user event.
		socket.emit('adminRegister', userCount);
		
		// Print debug message(s).
		console.log('IO Registered socket ID ' + socket.id + ' as administrator');

		// Update contestant data for admin.
		adminUpdateScores();
		
		// If contestant set, update admin index.
		if(contestant){
			
			// Send user response.
			socket.emit('ballotOpen', contestant);
		
			// Print debug message(s).
			console.log('IO Opening ballot "' + contestant.country + '" for administrator');
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
		
		// If socket not registered or no contestant set, return.
		if(!socket.registered || !contestant){
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

				// Update scores for admin and user.
				adminUpdateScores();
				userUpdateScores();

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

		// Update scores for user.
		userUpdateScores();
		
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
